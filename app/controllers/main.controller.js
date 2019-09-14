const Modal = require('../models/common.model.js');
var crypto = require('crypto');
var ts_hms = new Date();
var ObjectId = require('mongodb').ObjectID;

// Create and Save a new Modal
exports.create = (req, res) => {
    if (req.body.password != req.body.re_password){
        return res.status(400).send({
            message:"re_password wrong."
        });
    }
    if (req.body.password && req.body.username && req.body.email){
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
        // Save Modal in the database
        insert_user.save()
            .then(data => {
                res.status(200).send({
                    data:data
                });
            }).catch(err => {
                res.status(200).send({
                    message: "Some error occurred while creating the Modal."
                });
            });
    }else{
        return res.status(200).send({
            message: "all filed is required"
        });
    }
    return;
};

// Retrieve and return all Modals from the database.
exports.findAll = (req, res) => {
    let table = Modal[''+req['params']['db']+''];
    table.find()
        .then(data => {
            res.send(data);
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Modals."
            });
        });
};

// Find a single Modal with a ModalId
exports.findOne = (req, res) => {
    let table = Modal['' + req['params']['db'] + ''];
    table.findById(req.params.ModalId)
        .then(Modal => {
            if (!Modal) {
                return res.status(404).send({
                    message: "Modal not found with id " + req.params.ModalId
                });
            }
            res.send(Modal);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Modal not found with id " + req.params.ModalId
                });
            }
            return res.status(500).send({
                message: "Error retrieving Modal with id " + req.params.ModalId
            });
        });
};

// Update a Modal identified by the ModalId in the request
exports.update = (req, res) => {
    // Validate Request
    if (!req.body.content) {
        return res.status(400).send({
            message: "Modal content can not be empty"
        });
    }

    // Find Modal and update it with the request body
    Modal.findByIdAndUpdate(req.params.ModalId, {
        title: req.body.title || "Untitled Modal",
        content: req.body.content
    }, { new: true })
        .then(Modal => {
            if (!Modal) {
                return res.status(404).send({
                    message: "Modal not found with id " + req.params.ModalId
                });
            }
            res.send(Modal);
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Modal not found with id " + req.params.ModalId
                });
            }
            return res.status(500).send({
                message: "Error updating Modal with id " + req.params.ModalId
            });
        });
};

// Delete a Modal with the specified ModalId in the request
exports.delete = (req, res) => {
    Modal.findByIdAndRemove(req.params.ModalId)
        .then(Modal => {
            if (!Modal) {
                return res.status(404).send({
                    message: "Modal not found with id " + req.params.ModalId
                });
            }
            res.send({ message: "Modal deleted successfully!" });
        }).catch(err => {
            if (err.kind === 'ObjectId' || err.name === 'NotFound') {
                return res.status(404).send({
                    message: "Modal not found with id " + req.params.ModalId
                });
            }
            return res.status(500).send({
                message: "Could not delete Modal with id " + req.params.ModalId
            });
        });
};

//login
exports.login = (req, res) => {
    if (!req.body.email || !req.body.password ){
        return res.status(404).send({
            message: "please enter email and password"
        });
    }
    Modal.user.find({
        email: req.body.email,
        password: crypto.createHash('md5').update(req.body.password).digest("hex"),
    })
        .then(Modal => {
            if (Modal.length < 1) {
                return res.status(200).send({
                    message: "user not fount."
                });
            }
            if (Modal.status = 0) {
                return res.status(200).send({
                    message: "Your account not active."
                });
            }
            return res.status(200).send({
                data: Modal[0]
            });
        }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(200).send({
                    message: "Modal not found with id " + req.params.ModalId
                });
            }
            return res.status(200).send({
                message: "Error retrieving Modal with id " + req.params.ModalId
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
                l_c: { $size: "$lesson" },
                L_c: { $size: "$lecture" },
            }
        }
        // { $addFields: { "commentsCount": { $count: "$lesson" } } },
        // { $unwind: "$lecture" },
    ])
    .then(Modal => {
        return res.status(200).send({
            message: "successfully get",
            data: Modal,
        }); 
    }).catch(err => {
        return res.status(500).send({
            message: "Error retrieving Modal with id " + req.params.ModalId
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
            res.send(Modal);
        }).catch(err => {
            return res.status(500).send({
                message: "Error retrieving Modal with id " + req.params.ModalId
            });
        });
};

exports.course_single = (req, res) => {
    Modal.co.aggregate([
        { "$lookup": { "from": "author", "localField": "authorid", "foreignField": "id", "as": "author" } },
        { "$lookup": { "from": "lesson", "localField": "_id", "foreignField": "courseid", "as": "lesson", }, },
        { "$lookup": { "from": "lecture", "localField": "lesson._id", "foreignField": "lessonid", "as": "lecture", } },
        { "$lookup": { "from": "complete_courses", "localField": "_id", "foreignField": "course_id", "as": "complete_courses", } },
        { $match: { "course_slug": ""+req.params.courseslug+""}},
        ])
        .then(Modal => {
        var  com_count = 0;
        Modal[0]['lesson'].forEach(function (value, no) {
            Modal[0]['lesson'][no]['lecture'] = new Array();
        });
        Modal[0]['lecture'].forEach(function (value,no) {
            $lec = Modal[0]['lecture'];
            $com = Modal[0]['complete_courses'];
            $lesson_position = Modal[0]['lesson'].map(e => ""+e._id+"").indexOf(""+$lec[no]['lessonid']+"");
            if ($com.find(le => le.lesson_id == $lec[no]['lessonid']) && $com.find(lec => lec.lecture_id == $lec[no]['_id']) && $com.find(u => u.user_id == '3')){
                Modal[0]['lecture'][no]['c'] = 'complete';
                com_count++;
            }else{
                Modal[0]['lecture'][no]['c'] = 'incomplete';
            }
            Modal[0]['lesson'][$lesson_position]['lecture'].push(value);
        });
        Modal[0]['count'] = com_count;
        delete Modal[0]['lecture'];
        delete Modal[0]['complete_courses'];
            return res.status(200).send({
                message: "successfully get",
                data: Modal
            });
        }).catch(err => {
            return res.status(500).send({
                message: "Error retrieving Modal with id " + err
            });
        });
};

// Create complete course
exports.complete_courses = (req, res) => {
    if (req.body.course && req.body.lesson && req.body.userid && req.body.lecture) {
        const complete_courses = new Modal.complete_courses({
            user_id: req.body.course,
            course_id: req.body.lesson,
            lesson_id: req.body.userid,
            lecture_id: req.body.lecture
        });
        // Save Modal in the database
        complete_courses.save()
            .then(data => {
                res.send(data);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while creating the Modal."
                });
            });
    } else {
        return res.status(400).send({
            message: "something wrong please try again"
        });
    }
    return;
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
                message: "success fully get author",
                data : data,
            });
            res.send(data);
        }).catch(err => {
            res.status(200).send({
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
                message: "success fully get category",
                data: data,
            });
            res.send(data);
        }).catch(err => {
            res.status(200).send({
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
                    course_id: "$id",
                    user_id: req.body.post_data.id,
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$course_id', '$$course_id'] },
                                    { $eq: ['$user_id', req.body.post_data.id] },
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
                message: "successfully get course",
                data: data
            });
        }).catch(err => {
            return res.status(500).send({
                message: "Error retrieving Modal with id " + err
            });
        });
};

exports.lecture_single = (req, res) => {
    Modal.co.aggregate([
        { "$lookup": { "from": "author", "localField": "authorid", "foreignField": "id", "as": "author" } },
        { "$lookup": { "from": "lesson", "localField": "_id", "foreignField": "courseid", "as": "lesson", }, },
        // { "$lookup": { "from": "lecture", "localField": "lesson._id", "foreignField": "lessonid", "as": "lecture", } },
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
        { "$lookup": { "from": "complete_courses", "localField": "_id", "foreignField": "course_id", "as": "complete_courses", } },
        {
            "$lookup": {
                "from": "lesson",
                let: {
                    lesson_slug: req.params.lessonslug,
                    courseid: '$_id',
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$lesson_slug', '$$lesson_slug'] },
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
                    lecture_slug: req.params.lectureslug,
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
                                    { $eq: ['$lecture_slug', '$$lecture_slug'] },
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
        { $match: { "course_slug": "" + req.params.courseslug + "" } },
        // { $sort: { "lecture.number": -1 } },
         ])
        .then(Modal => {
            // res.send(Modal);
            // return;
        var  com_count = 0;
        Modal[0]['lesson'].forEach(function (value, no) {
            Modal[0]['lesson'][no]['lecture'] = new Array();
        });
        Modal[0]['lecture'].forEach(function (value,no) {
            $lec = Modal[0]['lecture'];
            $com = Modal[0]['complete_courses'];
            $lesson_position = Modal[0]['lesson'].map(e => ""+e._id+"").indexOf(""+$lec[no]['lessonid']+"");
            if ($com.find(le => le.lesson_id == $lec[no]['lessonid']) && $com.find(lec => lec.lecture_id == $lec[no]['_id']) && $com.find(u => u.user_id == '3')){
                Modal[0]['lecture'][no]['c'] = 'complete';
                com_count++;
            }else{
                Modal[0]['lecture'][no]['c'] = 'incomplete';
            }
            Modal[0]['lesson'][$lesson_position]['lecture'].push(value);
        });
        Modal[0]['count'] = com_count;
        delete Modal[0]['lecture'];
        delete Modal[0]['complete_courses'];
        delete Modal[0]['singlelesson'];
            return res.status(200).send({
                message: "successfully get",
                data: Modal
            });
        }).catch(err => {
            return res.status(500).send({
                message: "Error retrieving Modal with id " + err
            });
        });
};