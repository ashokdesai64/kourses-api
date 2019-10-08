module.exports = (app) => {
    const controller = require('../controllers/main.controller.js');
    const admin_controller = require('../controllers/admin.controller.js');
    // Create a new Note
    app.post('/create_user', controller.create);
 
    
    //login
    app.post('/login', controller.login);
    app.post('/course_detail', controller.course_detail);
    app.post('/course_single', controller.course_single);
    app.post('/lecture_single', controller.lecture_single);
    app.post('/category', controller.category);
    app.post('/complete_courses', controller.complete_courses);
    app.post('/get_author', controller.get_author);
    app.post('/get_category', controller.get_category);
    app.post('/complete_course_detail', controller.complete_course_detail);
    app.post('/sociallogin', controller.sociallogin);
    // app.post('/mail_send', controller.mail_send);
    app.post('/forget_password_fun', controller.forget_password_fun);
    app.post('/check_otp', controller.check_otp);
    app.post('/password_change', controller.password_change);


    // admin site
    app.post('/uploadjavatpoint', admin_controller.add_course);
}