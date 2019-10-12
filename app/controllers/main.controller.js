const Modal = require('../models/common.model.js');
var crypto = require('crypto');
var ts_hms = new Date();
var ObjectId = require('mongodb').ObjectID;
var nodemailer = require('nodemailer');
var localStorage = require('localStorage')

// Create and Save a new Modal
exports.create = (req, res) => {
    if (req.body.password != req.body.re_password){
        return res.status(200).send({
            status:'success',
            message:"re password wrong try again."
        });
    }
    if (req.body.password && req.body.username && req.body.email){
        Modal.user.find({ email: req.body.email })
            .then(value => {
                if (value.length == 0) {
                    const insert_user = new Modal.user({
                        username: req.body.username,
                        email: req.body.email,
                        password: crypto.createHash('md5').update(req.body.password).digest("hex"),
                        login_type: 'web',
                        type: '1',
                        status: '1',
                        date_created: ts_hms,
                        date_updated: ts_hms,
                    });
                    insert_user.save()
                    .then(data => {
                        res.status(200).send({
                            status: 'success',
                            message: "successfully user registed.",
                            // data:data
                        });
                    }).catch(err => {
                        res.status(200).send({
                            status: 'error',
                            message: "something wrong please try again."
                        });
                    });
                }else{
                    res.status(200).send({
                        status: 'error',
                        message: "email already used."
                    });
                }
            }).catch(err => {
                res.status(200).send({
                    status: "error",
                    message: "Some error occurred while creating the Modal."
                });
            });
    }else{
        return res.status(200).send({
            message: "all filed is required."
        });
    }
    return;
};

// Find a single Modal with a ModalId
exports.sociallogin = (req, res) => {
    if (!req.body.email){
        return res.status(200).send({
            status: "error",
            message: "Email not found.",
        });
    }
    Modal.user.find({ email: req.body.email })
        .then(value => {
            if (value.length == 0) {
                const insert_user = new Modal.user({
                    username: req.body.username,
                    email: req.body.email,
                    type: "1",
                    status: "1",
                    login_type : req.body.type,
                    date_created: ts_hms,
                    date_updated: ts_hms,
                });
                insert_user.save()
                    .then(data => {
                        delete data[0]['password'];
                        delete data[0]['login_type'];
                        delete data[0]['type'];
                        delete data[0]['status'];
                        res.status(200).send({
                            status: "success",
                            data: value[0],
                            message: "successfully user login.",
                        });
                    }).catch(err => {
                        res.status(200).send({
                            status: "error",
                            message: "something wrong please try again."
                        });
                    });
            }else{
                delete value[0]['password'];
                delete value[0]['login_type'];
                delete value[0]['type'];
                delete value[0]['status'];
                return res.status(200).send({
                    status: "success",
                    data: value[0],
                    message: "successfully user login.",
                });
            }
        }).catch(err => {
            return res.status(200).send({
                status: "error",
                message: "something wrong please after sometimes.",
            });
        });
};

//login
exports.login = (req, res) => {
    if (!req.body.email || !req.body.password ){
        return res.status(200).send({
            status: "error",
            message: "email and password not found.",
        });
    }
    Modal.user.find({
        email: req.body.email,
        password: crypto.createHash('md5').update(req.body.password).digest("hex"),
    })
        .then(Modal => {
            if (Modal.length < 1) {
                return res.status(200).send({
                    status: "error",
                    message: "user not fount."
                });
            }
            if (Modal.status = 0) {
                return res.status(200).send({
                    status: "error",
                    message: "your account not active."
                });
            }
            delete Modal[0]['password'];
            delete Modal[0]['login_type'];
            delete Modal[0]['type'];
            delete Modal[0]['status'];
            return res.status(200).send({
                data: Modal[0],
                status: 'success',
                message: 'successfully login.'
            });
        }).catch(err => {
            return res.status(200).send({
                status: "error",
                message: "something wrong please try again."
            });
        });
};


exports.course_detail = (req, res) => {
    Modal.co.aggregate([
        {
            "$lookup": {
                "from": "author",
                "localField": "authorid",
                "foreignField": "id",
                "as": "author"
            }
        },
        {
            "$lookup": {
                "from": "lesson",
                "localField": "_id",
                "foreignField": "courseid",
                "as": "lesson",
            },
        },
        {
            "$lookup": {
                "from": "lecture",
                "localField": "_id",
                "foreignField": "courseid",
                "as": "lecture",
            }
        },
        {
            $project: {
                _id:"$_id",
                id:"$id",
                auhtorname:"$author.username",
                auhtorimage:"$author.image",
                authorid:"$authorid",
                categoryid:"$categoryid",
                image:"$image",
                price:"$price",
                title:"$title",
                course_slug:"$course_slug",
                subtitle:"$subtitle",
                sort_description:"$sort_description",
                description:"$description",
                lesson_count: { $size: "$lesson" },
                lecture_count: { $size: "$lecture" },
            }
        }
        // { $addFields: { "commentsCount": { $count: "$lesson" } } },
        // { $unwind: "$lecture" },
    ])
    .then(Modal => {
        return res.status(200).send({
            status: "success",
            message: "successfully get course.",
            data: Modal,
        }); 
    }).catch(err => {
        return res.status(200).send({
            status: "error",
            message: "something wrong can'\t get course data.",
            data: Modal,
        }); 
    });
};

exports.category = (req, res) => {
    Modal.category.aggregate([
        {
            "$lookup": {
                "from": "course",
                "localField": "id",
                "foreignField": "categoryid",
                "as": "course",
            }
        },
        {
            $project: {
                _id: "$_id",
                id: "$id",
                name: "$name",
                status: "$status",
                date_created: "$date_created",
                date_modified: "$date_modified",
                c_c: { $size: "$course" },
            }
        }
    ])
        .then(Modal => {
            return res.status(200).send({
                status: "success",
                data: Modal,
                message: "successfully get category.",
            });
            res.send(Modal);
        }).catch(err => {
            return res.status(200).send({
                status: "error",
                message: "something wrong can'\t get category.",
            });
        });
};

exports.course_single = (req, res) => {
    Modal.co.aggregate([
        { "$lookup": { "from": "author", "localField": "authorid", "foreignField": "id", "as": "author" } },
        {
            "$lookup": {
                "from": "lesson",
                "let": { "uuid": "$_id" },
                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$$uuid", "$courseid"] } } },
                    { "$sort": { "number": 1 } }
                ],
                "as": "lesson"
            }
        },
        {
            "$lookup": {
                "from": "lecture",
                "let": { "uuid": "$_id" },
                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$$uuid", "$courseid"] } } },
                    { "$sort": { "id": 1 } }
                ],
                "as": "lecture"
            }
        },
        {
            "$lookup": {
                "from": "complete_courses",
                let: {
                    userid: ObjectId(req.body.userid),
                    course_id: "$_id",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$user_id', '$$userid'] },
                                    { $eq: ['$course_id', "$$course_id"] },
                                ]
                            }
                        }
                    }
                ],
                "as": "complete_courses",
            },
        },
        { $match: { "course_slug": req.body.course } },
    ])
        .collation({ locale: "en_US", numericOrdering: true })
        .then(Modal => {
            delete Modal[0]['author'][0]['github'];
            delete Modal[0]['author'][0]['linkedin'];
            delete Modal[0]['author'][0]['twitter'];
            delete Modal[0]['author'][0]['password'];
            delete Modal[0]['author'][0]['status'];
            delete Modal[0]['author'][0]['is_deleted'];
            var com_count = 0;
            $pre_length = "";
            $next_length = "";
            var total_lecture = 0;
            Modal[0]['lesson'].forEach(function (val, n) {
                Modal[0]['lesson'][n]['lecture'] = new Array();
            });
            Modal[0]['lecture'].forEach(function (value, no) {
                total_lecture++;
                $lec = Modal[0]['lecture'];
                $com = Modal[0]['complete_courses'];
                $lesson_position = Modal[0]['lesson'].map(e => "" + e._id + "").indexOf("" + $lec[no]['lessonid'] + "");
                if ($com.find(le => JSON.stringify(le.lecture_id) === JSON.stringify(value['_id']))) {
                    Modal[0]['lecture'][no]['c'] = 'complete';
                    com_count++;
                } else {
                    Modal[0]['lecture'][no]['c'] = 'incomplete';
                }
                Modal[0]['lesson'][$lesson_position]['lecture'].push(value);
            });
            Modal[0]['count'] = Math.round(com_count * 100 / total_lecture);
            delete Modal[0]['lecture'];
            delete Modal[0]['complete_courses'];
            return res.status(200).send({
                message: "successfully get.",
                status: "success",
                data: Modal
            });
        }).catch(err => {
            return res.status(200).send({
                message: "something wrong get data.",
                status: "error",
            });
        });
        
};

// Create complete course
exports.complete_courses = (req, res) => {
    if (req.body.course && req.body.lesson && req.body.userid && req.body.lecture) {
        Modal.complete_courses.find({
            user_id: ObjectId(req.body.userid),
            course_id: ObjectId(req.body.course),
            lesson_id: ObjectId(req.body.lesson),
            lecture_id: ObjectId(req.body.lecture)
        }).then(check_data => {
            if (check_data.length == 0){
                const complete_courses = new Modal.complete_courses({
                    user_id: ObjectId(req.body.userid),
                    course_id: ObjectId(req.body.course),
                    lesson_id: ObjectId(req.body.lesson),
                    lecture_id: ObjectId(req.body.lecture)
                });
                // Save Modal in the database
                complete_courses.save()
                    .then(data => {
                        res.status(200).send({
                            status: "success",
                            message: "Successfully completed."
                        });
                    }).catch(err => {
                        res.status(200).send({
                            status: "error",
                            message: "something wrong please try agian."
                        });
                    });
            }else{
                res.status(200).send({
                    status: "success",
                    message: "Successfully completed."
                });
            }
        });
    } else {
        return res.status(200).send({
            status: "error",
            message: "something wrong please try again."
        });
    }
};

exports.get_author = (req, res) => {
    Modal.author.aggregate([
        {
            "$lookup": {
                "from": "course",
                "localField": "id",
                "foreignField": "authorid",
                "as": "course"
            }
        },
        {
            $project: {
                authorid: "$id",
                username: "$username",
                count: { $size: "$course" },
            }
        }
    ])
        .then(data => {
            res.status(200).send({
                status: "success",
                message: "success fully get author.",
                data : data,
            });
            res.send(data);
        }).catch(err => {
            res.status(200).send({
                status: "error",
                message: "Some error occurred while retrieving Modals.",
                data: "",
            });
        });
};

exports.get_category = (req, res) => {
    Modal.category.aggregate([
        {
            "$lookup": {
                "from": "course",
                "localField": "id",
                "foreignField": "categoryid",
                "as": "course"
            }
        },
        {
            $project: {
                categoryid: "$id",
                name: "$name",
                count: { $size: "$course" },
            }
        }
    ])
        .then(data => {
            res.status(200).send({
                status: "success",
                message: "success fully get category.",
                data: data,
            });
            res.send(data);
        }).catch(err => {
            res.status(200).send({
                status: "error",
                message: "Some error occurred while retrieving Modals.",
                data: "",
            });
        });
};

exports.complete_course_detail = (req, res) => {
    Modal.co.aggregate([
        {
            "$lookup": {
                "from": "author",
                "localField": "authorid",
                "foreignField": "id",
                "as": "author"
            }
        },
        {
            "$lookup": {
                "from": "lesson",
                "localField": "_id",
                "foreignField": "courseid",
                "as": "lesson",
            },
        },
        {
            "$lookup": {
                "from": "lecture",
                "localField": "_id",
                "foreignField": "courseid",
                "as": "lecture",
            }
        },
        {
            "$lookup": {
                "from": "complete_courses",
                let: {
                    userid: ObjectId(req.body.post_data.id),
                    course_id: "$_id",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$user_id', '$$userid'] },
                                    { $eq: ['$course_id', "$$course_id"] },
                                ]
                            }
                        }
                    }
                ],
                "as": "complete_courses",
            },
        },
        {
            $project: {
                id: "$id",
                auhtorname: "$author.username",
                auhtorimage: "$author.image",
                image: "$image",
                price: "$price",
                authorid: "$authorid",
                categoryid: "$categoryid",
                title: "$title",
                course_slug: "$course_slug",
                subtitle: "$subtitle",
                sort_description: "$sort_description",
                description: "$description",
                description: "$description",
                l_c: { $size: "$lesson" },
                L_c: { $size: "$lecture" },
                complete_courses: { $size: "$complete_courses" },
            }
        }
        // { $addFields: { "commentsCount": { $count: "$lesson" } } },
        // { $unwind: "$lecture" },
    ])
        .then(data => {
            return res.status(200).send({
                status: "success",
                message: "successfully get course.",
                data: data
            });
        }).catch(err => {
            return res.status(500).send({
                status: "error",
                message: "something wrong please try again."
            });
        });
};

exports.lecture_single = (req, res) => {
    Modal.co.aggregate([
        { "$lookup": { "from": "author", "localField": "authorid", "foreignField": "id", "as": "author" } },
        {
            "$lookup": {
                "from": "lesson",
                "let": { "uuid": "$_id" },
                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$$uuid", "$courseid"] } } },
                    { "$sort": { "number": 1 } }
                ],
                "as": "lesson"
            }
        },
        {
            "$lookup": {
                "from": "lecture",
                "let": { "uuid": "$_id" },
                "pipeline": [
                    { "$match": { "$expr": { "$eq": ["$$uuid", "$courseid"] } } },
                    { "$sort": { "id": 1    } }
                ],
                "as": "lecture"
            }
        },
        {
            "$lookup": {
                "from": "complete_courses",
                let: {
                    userid: ObjectId(req.body.userid),
                    course_id: "$_id",
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$user_id', '$$userid'] },
                                    { $eq: ['$course_id', "$$course_id"] },
                                ]
                            }
                        }
                    }
                ],
                "as": "complete_courses",
            },
        },
        // { "$lookup": { "from": "complete_courses", "localField": "lecture._id", "foreignField": "lecture_id", "as": "complete_courses", } },
        {
            "$lookup": {
                "from": "lesson",
                let: {
                    lessonid: req.body.lesson,
                    courseid: '$_id',
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$lesson_slug', '$$lessonid'] },
                                    { $eq: ['$courseid', '$$courseid'] },
                                ]
                            }
                        }
                    }
                ],
                "as": "singlelesson",
            },

        },
        { "$unwind": "$singlelesson" },
        {
            "$lookup": {
                "from": "lecture",
                let: {
                    lectureid: req.body.lecture,
                    lessonid: "$singlelesson._id",
                    courseid: '$_id',
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$courseid', '$$courseid'] },
                                    { $eq: ['$lessonid', "$$lessonid" ] },
                                    { $eq: ['$lecture_slug', '$$lectureid'] },
                                ]
                            }
                        }
                    }
                ],
                "as": "single_lecture",
            },
        },
        { "$unwind": "$single_lecture" },
        { "$lookup": { "from": "download_data", "localField": "single_lecture._id", "foreignField": "lectureid", "as": "download_data", } },
        { $match: { "course_slug" :  req.body.course } },
        // { $sort: { "lecture.number": -1 } },
         ])
        .collation({ locale: "en_US", numericOrdering: true })
        .then(Modal => {
            delete Modal[0]['author'][0]['github'];
            delete Modal[0]['author'][0]['linkedin'];
            delete Modal[0]['author'][0]['twitter'];
            delete Modal[0]['author'][0]['password'];
            delete Modal[0]['author'][0]['status'];
            delete Modal[0]['author'][0]['is_deleted'];
        var  com_count = 0;
        $pre_length = "";
        $next_length = "";
        var total_lecture = 0;
        Modal[0]['lesson'].forEach(function (val, n) {
            Modal[0]['lesson'][n]['lecture'] = new Array();
        });
        Modal[0]['lecture'].forEach(function (value,no) {
            total_lecture++;
            $lec = Modal[0]['lecture'];
            $com = Modal[0]['complete_courses'];
            $lesson_position = Modal[0]['lesson'].map(e => ""+e._id+"").indexOf(""+$lec[no]['lessonid']+"");
            if ($com.find(le => JSON.stringify(le.lecture_id) === JSON.stringify(value['_id']))){
                Modal[0]['lecture'][no]['c'] = 'complete';
                com_count++;
            }else{
                Modal[0]['lecture'][no]['c'] = 'incomplete';
            }
            Modal[0]['lesson'][$lesson_position]['lecture'].push(value);
        });
            $next_pre = "";
            $lesson_index = "";
                Modal[0]['lesson'].map(function (e, n) {e.lecture.map(
                    function (o,no) { 
                        if (o.lecture_slug === req.body.lecture && e.lesson_slug === req.body.lesson){
                            $next_pre = no;
                            $lesson_index = n;
                        }
                    }) });
            if (Modal[0]['lesson'][$lesson_index]['lecture'][$next_pre-1]) {
                Modal[0]['pre'] = '/course/' + req.body.course + '/lesson/' + Modal[0]['lesson'][$lesson_index]['lesson_slug'] + '/lecture/' + Modal[0]['lesson'][$lesson_index]['lecture'][$next_pre - 1]['lecture_slug'] + '';
            } else {
                if (Modal[0]['lesson'][$lesson_index - 1]) {
                    $lec_l = Modal[0]['lesson'][$lesson_index - 1]['lecture'].length - 1
                    Modal[0]['pre'] = '/course/' + req.body.course + '/lesson/' + Modal[0]['lesson'][$lesson_index - 1]['lesson_slug'] + '/lecture/' + Modal[0]['lesson'][$lesson_index - 1]['lecture'][$lec_l]['lecture_slug'] + '';
                }
            }
            if (Modal[0]['lesson'][$lesson_index]['lecture'][$next_pre+1]) {
                Modal[0]['next'] = '/course/' + req.body.course + '/lesson/' + Modal[0]['lesson'][$lesson_index]['lesson_slug'] + '/lecture/' + Modal[0]['lesson'][$lesson_index]['lecture'][$next_pre+1]['lecture_slug'] + '';
            } else {
                if (Modal[0]['lesson'][$lesson_index + 1]) {
                    Modal[0]['next'] = '/course/' + req.body.course + '/lesson/' + Modal[0]['lesson'][$lesson_index + 1]['lesson_slug'] + '/lecture/' + Modal[0]['lesson'][$lesson_index + 1]['lecture'][0]['lecture_slug'] + '';
                }
            }
        Modal[0]['count'] = Math.round(com_count * 100 / total_lecture);
        delete Modal[0]['lecture'];
        delete Modal[0]['complete_courses'];
        delete Modal[0]['singlelesson'];
            return res.status(200).send({
                status:'success',
                message: "successfully get",
                data: Modal
            });
        }).catch(err => {
            return res.status(200).send({
                status: 'error',
                message: "something wrong please try again.",
            });
        });
};

exports.forget_password_fun = (req, res) => {
    if (!req.body.email) {
        return res.status(200).send({
            status: "error",
            message: "Email not found",
        });
    }
    Modal.user.find({ email: req.body.email })
        .then(value => {
            if (value.length != 0) {
                var transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: "jaydip.qsek@gmail.com",
                        pass: "Jaydip@605"
                    }
                });
                const mailOptions = {
                    from: 'Kourses <admin@gmail.com>',
                    to: req.body.email,
                    subject: 'Forget Password',
                    html: Modal.email_html['html'],
                }
                transporter.sendMail(mailOptions, function (err, info) {
                    if (err) {
                        return res.status(200).send({
                            status: "error",
                            message: "something wrong.",
                        });
                    } else {
                        Modal.user.findOneAndUpdate(
                            { email: req.body.email },
                            { $set: { "otp": Modal.email_html['code'] } },
                        { new: true }).then(update_otp => {
                            return res.status(200).send({
                                status: "success",
                                message: "your email address founded.",
                            });
                        }).catch(err => {
                            return res.status(200).send({
                                status: "error",
                                message: "something wrong.",
                            });
                        });
                    }
                });
            } else {
                return res.status(200).send({
                    status: "error",
                    message: "User not found.",
                });
            }
        }).catch(err => {
            return res.status(200).send({
                status: "error",
                message: "something wrong please try after some time."
            });
        });
};

exports.check_otp = (req, res) => {
    if (!req.body.otp && !req.body.email) {
        return res.status(200).send({
            status: "error",
            message: "otp not found.",
        });
    }
    Modal.user.find({ email: req.body.email })
    .then(value => {
        if (req.body.otp == value[0].otp) {
            return res.status(200).send({
                status: "success",
                message: "OTP matched."
            });
        }else{
            return res.status(200).send({
                status: "error",
                message: "OTP not matched."
            });
        }
    }).catch(err => {
        return res.status(200).send({
            status: "error",
            message: "something wrong please try after some time."
        });
    });
}

exports.password_change = (req, res) => {
    if (req.body.email && req.body.password) {
        Modal.user.findOneAndUpdate(
            { email: req.body.email },
            { $set: { "password": crypto.createHash('md5').update(req.body.password).digest("hex") } },
        { new: true }).then(cng_pass => {
            return res.status(200).send({
                status: "success",
                message: "successfully password changed.",
            });
        }).catch(err => {
            return res.status(200).send({
                status: "error",
                message: "something wrong.",
            });
        });
    }else{
        return res.status(200).send({
            status: "error",
            message: "some field missing."
        });
    }
}


// Create complete course
exports.contact_us = (req, res) => {
    if (req.body.email  && req.body.username && req.body.subject && req.body.message) {
        const contact_us = new Modal.contact_us({
            username: req.body.username,
            email: req.body.email,
            subject: req.body.subject,
            message: req.body.message,
        });
        // Save Modal in the database
        contact_us.save()
            .then(data => {
                res.status(200).send({
                    status: "success",
                    message: "Successfully send message."
                });
            }).catch(err => {
                res.status(200).send({
                    status: "error",
                    message: "something wrong please try agian."
                });
            });
    } else {
        return res.status(200).send({
            status: "error",
            message: "something wrong please try again."
        });
    }
};