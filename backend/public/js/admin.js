document.addEventListener('DOMContentLoaded', () => {
    // Check Admin Auth
    checkAdmin();

    document.getElementById('logoutBtn').addEventListener('click', () => {
        document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = '/login';
    });

    // Upload Form
    document.getElementById('uploadForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById('excelFile');
        if (!fileInput.files[0]) return alert('Please select a file');

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        try {
            const res = await fetch('/api/cert/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                alert(`Successfully uploaded ${data.count} students.`);
                loadStudents();
                fileInput.value = '';
            } else {
                alert('Upload failed: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            alert('Error during upload');
        }
    });

    // Initial Load
    loadStudents();
});

async function checkAdmin() {
    try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (!data.success || data.data.role !== 'admin') {
            window.location.href = '/login';
        }
    } catch (err) {
        window.location.href = '/login';
    }
}

async function loadStudents() {
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Loading...</td></tr>';

    try {
        const res = await fetch('/api/cert/students');
        const data = await res.json();

        if (data.success) {
            if (data.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No students found. Upload an Excel file to get started.</td></tr>';
                return;
            }

            tbody.innerHTML = '';
            data.data.forEach(student => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #f1f5f9';
                tr.innerHTML = `
                    <td style="padding: 1rem;">${student.name}</td>
                    <td style="padding: 1rem;">${student.email}</td>
                    <td style="padding: 1rem;">${student.course}</td>
                    <td style="padding: 1rem; font-family: monospace; color: var(--primary);">${student.certificateId || '-'}</td>
                    <td style="padding: 1rem;">
                        <span style="padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.8rem; background: ${student.status === 'Generated' ? '#dcfce7' : '#fef9c3'}; color: ${student.status === 'Generated' ? '#166534' : '#854d0e'};">
                            ${student.status}
                        </span>
                    </td>
                    <td style="padding: 1rem;">
                        ${student.status === 'Pending'
                        ? `<button onclick="generateCert('${student._id}')" class="btn btn-primary" style="padding: 0.25rem 0.75rem; font-size: 0.8rem;">Generate</button>`
                        : `<a href="${student.pdfUrl}" target="_blank" class="btn btn-outline" style="padding: 0.25rem 0.75rem; font-size: 0.8rem;">Download</a>`
                    }
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load data.</td></tr>';
    }
}

window.generateCert = async (id) => {
    if (!confirm('Generate certificate for this student?')) return;

    try {
        const btn = document.activeElement;
        btn.textContent = 'Processing...';
        btn.disabled = true;

        const res = await fetch(`/api/cert/generate/${id}`, { method: 'POST' });
        const data = await res.json();

        if (data.success) {
            loadStudents();
        } else {
            alert('Generation failed: ' + data.error);
            btn.textContent = 'Generate';
            btn.disabled = false;
        }
    } catch (err) {
        console.error(err);
        alert('Error generating certificate');
    }
};
