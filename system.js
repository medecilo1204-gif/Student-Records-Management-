let db;
const form = document.getElementById("studentForm");
const Fullname = form.elements["fname"];
const Email = form.elements["email"];
const Level = form.elements["Ylev"];
const StudentID = form.elements["studentID"];


// events

form.onreset = function (e){ 
            confirm(" 🧹 Are you sure you want to reset?"); 
            output.innerHTML = "";  }

        Level.onchange = () => alert(" ✅ You selected: " + Level.value);

        Fullname.oninput = () => console.log("Typing: " + Fullname.value);

        Fullname.onfocus = () => Fullname.style.background = "lightblue";
        Fullname.onblur = () => Fullname.style.background = "";
        
        Email.onfocus = () => Email.style.background = "lightblue";
        Email.onblur = () => Email.style.background = "";

        Level.onfocus = () => Level.style.background = "lightblue";
        Level.onblur = () => Level.style.background = "";

        StudentID.onfocus = () => StudentID.style.background = "lightblue";
        StudentID.onblur = () => StudentID.style.background = "";

// database

const request = indexedDB.open('StudentDB', 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    const store = db.createObjectStore('students', { keyPath: 'studentID' });
    store.createIndex('studentID', 'studentID', { unique: true });
};

request.onsuccess = function(event) {
    console.log("onsuccess works");
    db = event.target.result;
    displayRecords();
};

request.onerror = function() {
    alert("Database failed to open");
};

// --- Display Records ---
function displayRecords() {
    console.log("displaying works");
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    const transaction = db.transaction(['students'], 'readonly');
    const store = transaction.objectStore('students');

    store.openCursor().onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor) {
            const student = cursor.value;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.studentID}</td>
                <td contenteditable="true" data-field="fname">${student.fname}</td>
                <td contenteditable="true" data-field="course">${student.course}</td>
                <td contenteditable="true" data-field="Ylev">${student.Ylev}</td>
                <td contenteditable="true" data-field="email">${student.email}</td>
                <td>
                    <button onclick="updateRecord('${student.studentID}', this)">Edit</button>
                    <button onclick="deleteRecord('${student.studentID}')">Delete</button>
                </td>`;
            tbody.appendChild(row);
            cursor.continue();
        }
    };
}

// update
function updateRecord(studentID, btn) {
    console.log("upadting works");
    if (!confirm("Are you sure you want to update this record?")) return;

    const row = btn.parentElement.parentElement;
    const updatedStudent = {
        studentID,
        fname: row.children[1].textContent.trim(),
        course: row.children[2].textContent.trim(),
        Ylev: row.children[3].textContent.trim(),
        email: row.children[4].textContent.trim()
    };

    const transaction = db.transaction(['students'], 'readwrite');
    const store = transaction.objectStore('students');
    store.put(updatedStudent);
    transaction.oncomplete = () => {
        alert("✅ Record updated!");
        displayRecords();
    };
}

// delete
function deleteRecord(studentID) {
    console.log("deleting works");
    if (!confirm("Are you sure you want to delete this record?")) return;

    const transaction = db.transaction(['students'], 'readwrite');
    const store = transaction.objectStore('students');
    store.delete(studentID);
    transaction.oncomplete = () => {
        alert("🗑️ Record deleted!");
        displayRecords();
    };
}

// searching
document.getElementById('searchInput').addEventListener('keyup', function() {

    console.log("searching works");

    const searchValue = this.value.toLowerCase();
    const rows = document.querySelectorAll('#tableBody tr');
    rows.forEach(row => {
        const id = row.children[0].textContent.toLowerCase();
        const course = row.children[2].textContent.toLowerCase();
        const year = row.children[3].textContent.toLowerCase();
        if (id.includes(searchValue) || course.includes(searchValue) || year.includes(searchValue)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// onsubmit
form.onsubmit = function(e) {
    e.preventDefault();

    console.log('adding works');
    
    const studentID = StudentID.value.trim();
    const fname = Fullname.value.trim();
    const course = document.getElementById('course').value.trim();
    const email = Email.value.trim();
    const Ylev = Level.value;

    // Validation
    if (!studentID || !fname || !course || !email || !Ylev) {
        alert("⚠️ Please fill in all fields.");
        return;
    }

    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!emailPattern.test(email)) {
        alert("⚠️ Invalid email format!");
        return;
    }

    const transaction = db.transaction(['students'], 'readwrite');
    const store = transaction.objectStore('students');
    const studentData = {studentID, fname, course, email, Ylev};

    const requestAdd = store.add(studentData);
    requestAdd.onsuccess = () => {
        alert("Student record added!");
        form.reset();
        displayRecords();
    };
    requestAdd.onerror = () => {
        alert("Error adding student. Student ID must be unique.");
    };
};
