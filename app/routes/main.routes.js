module.exports = (app) => {
    const controller = require('../controllers/main.controller.js');
    const admin_controller = require('../controllers/admin.controller.js');
    // Create a new Note
    app.post('/create_user', controller.create);

    // Retrieve all controller
    app.get('/table/:db', controller.findAll);

    // Retrieve a single Note with noteId
    app.get('/controller/:db/:noteId', controller.findOne);

    // Update a Note with noteId
    app.put('/controller/:db/:noteId', controller.update);
    
    // Delete a Note with noteId
    app.delete('/controller/:noteId', controller.delete);
    
    
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

    // admin site
    app.post('/uploadjavatpoint', admin_controller.add_course);
}