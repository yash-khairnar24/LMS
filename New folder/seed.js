async function seedData() {
  try {
    console.log('Registering teacher...');
    let res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alan Turing',
        email: 'alan.teacher@example.com',
        password: 'password123',
        role: 'teacher'
      })
    });
    console.log(await res.text());

    console.log('Logging in teacher...');
    res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alan.teacher@example.com',
        password: 'password123'
      })
    });
    let teacherLogin = await res.json();
    const teacherToken = teacherLogin.token;

    console.log('Creating class...');
    res = await fetch('http://localhost:5000/api/classes', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${teacherToken}` 
      },
      body: JSON.stringify({
        class_name: 'Advanced Mathematics 101',
        description: 'An advanced mathematical class for students who want to excel in problem-solving and algorithms.'
      })
    });
    let createClassRes = await res.json();
    
    // In case the class was already created (script run twice), fetch existing class
    let classId = createClassRes.classId;
    if (!classId) {
       let clsList = await fetch('http://localhost:5000/api/classes/all', {
         headers: { Authorization: `Bearer ${teacherToken}` }
       }).then(r => r.json());
       classId = clsList.classes.find(c => c.class_name === 'Advanced Mathematics 101').id;
    }

    console.log('Registering student...');
    res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Student Demo',
        email: 'student@example.com',
        password: 'password123',
        role: 'student'
      })
    });
    console.log(await res.text());

    console.log('Logging in student...');
    res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@example.com',
        password: 'password123'
      })
    });
    let studentLogin = await res.json();
    const studentToken = studentLogin.token;

    console.log('Enrolling student...');
    res = await fetch('http://localhost:5000/api/classes/enroll', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}` 
      },
      body: JSON.stringify({
        class_id: classId
      })
    });
    console.log(await res.text());

    console.log('-----------------------------------------');
    console.log('Dummy records injected successfully!');
    console.log('Teacher Login:', 'alan.teacher@example.com', '/', 'password123');
    console.log('Student Login:', 'student@example.com', '/', 'password123');
  } catch (err) {
    console.error('Seeding failed:', err.message);
  }
}

seedData();
