const mongoose = require('mongoose');

const author = new mongoose.Schema();
author.set('collection', 'author');
module.exports.author = mongoose.model('author', author);

const category = new mongoose.Schema({
    id: String,
    name: String,
    status: String,
}, {
        timestamps: true
    });
category.set('collection', 'category');
module.exports.category = mongoose.model('category', category);

const user = new mongoose.Schema( {
    id: String,
    username: String,
    email: String,
    password : String,
    type: String,
    status: String,
    token: String,
    social_id: String,
    login_type: String,
    remember_token: String,
    date_created: Date,
    date_updated: Date,
});
user.set('collection', 'user');
module.exports.user = mongoose.model('user', user);

const complete_courses = new mongoose.Schema({
    user_id: Object,
    course_id: Object,
    lesson_id: Object,
    lecture_id: Object,
}, {
        timestamps: true
    });
complete_courses.set('collection', 'complete_courses');
module.exports.complete_courses = mongoose.model('complete_courses', complete_courses);


const course  = new mongoose.Schema({
    id: String,
    authorid: String,
    categoryid: String,
    image: String,
    price: String,
    title: String,
    course_slug: String,
    subtitle: String,
    sort_description: String,
    description: String,
    tags: String,
    status: String,
    is_deleted: String,
}, {
        timestamps: true
    });
course .set('collection', 'course');
module.exports.course  = mongoose.model('course', course );


const download_data  = new mongoose.Schema({
    id: String,
    lectureid: String,
    type: String,
    data_title: String,
    data_link: String,
}, {
        timestamps: true
    });
download_data .set('collection', 'download_data');
module.exports.download_data  = mongoose.model('download_data', download_data );



const lecture  = new mongoose.Schema({
    id: String,
    courseid: String,
    lessonid: String,
    title: String,
    lecture_slug: String,
    type: String,
    lecture_data: String,
    duration: String,
    status: String,
}, {
        timestamps: true
    });
lecture .set('collection', 'lecture');
module.exports.lecture  = mongoose.model('lecture', lecture );

const lesson  = new mongoose.Schema({
    id: String,
    courseid: String,
    name: String,
    lesson_slug: String,
    image: String,
    status: String,
}, {
        timestamps: true
    });
lesson .set('collection', 'lesson');
module.exports.lesson  = mongoose.model('lesson', lesson );

// const co = new mongoose.Schema();
// co.set('collection', 'course');
module.exports.co = mongoose.model('co', course);

