var express = require('express');
var router = express.Router();
var model = require('../model');


var multiparty = require('multiparty');
var fs = require('fs');

/* GET users listing. */

router.post('/add', function (req, res, next) {
    var data = {
        title: req.body.title,
        content: req.body.content,
        // username: req.session.username,
        id: Date.now()
    }
    model.connect(function (db) {
        db.collection('articles').insertOne(data, function (err, ret) {
            if (err) {
                console.log('文件发布失败', err)
                res.redirect('/write')
            } else {
                res.redirect('/')
            }
        })

    })
})


// 新增、编辑
router.post('/add', function (req, res, next) {
    var id = parseInt(req.body.id)
    if (id) {  // 编辑
        var page = req.body.page
        var title = req.body.title
        var content = req.body.content
        model.connect(function (db) {
            db.collection('articles').updateOne({ id: id }, {
                $set: {
                    title: title,
                    content: content
                }
            }, function (err, ret) {
                if (err) {
                    console.log('修改失败', err)
                } else {
                    console.log('修改成功')
                    res.redirect('/?page=' + page)
                }
            })
        })
    } else {   // 新增
        var data = {
            title: req.body.title,
            content: req.body.content,
            username: req.session.username,
            id: Date.now()
        }
        model.connect(function (db) {
            db.collection('articles').insertOne(data, function (err, ret) {
                if (err) {
                    console.log('文件发布失败', err)
                    res.redirect('/write')
                } else {
                    res.redirect('/')
                }
            })
        })
    }
})


// 删除文章
router.get('/delete', function (req, res, next) {
    var id = parseInt(req.query.id)
    var page = req.query.page
    model.connect(function (db) {
        db.collection('articles').deleteOne({ id: id }, function (err, ret) {
            if (err) {
                console.log('删除失败')
            } else {
                console.log('删除成功')
            }
            res.redirect('/?page=' + page)
        })
    })
})

//   上传文章
router.post('/upload', function (req, res, next) {
    var form = new multiparty.Form()
    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log('上传失败', err);
        } else {
            console.log('文件列表', files)
            var file = files.filedata[0]
            // 通过node的内置模块将文件写到硬盘上
            //添加文件流
            var rs = fs.createReadStream(file.path)
            var newPath = '/uploads/' + file.originalFilename
            var ws = fs.createWriteStream('./public' + newPath)
            // 通过管道流来操作
            rs.pipe(ws)
            ws.on('close', function () {
                console.log('文件上传成功')
                res.send({ err: '', msg: newPath })
            })
        }
    })
})
module.exports = router;

