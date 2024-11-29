import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { EMPLOYEES_URL, LEAVE_REQUEST_URL } from '../services';

const Employees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [modalMode, setModalMode] = useState(null);
    const [alert, setAlert] = useState({ type: '', message: '' });

    const [formData, setFormData] = useState({
        username: '',
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        is_employee: false,
        annual_leave_days: 0,
        resume: null
    });

    const [leaveFormData, setLeaveFormData] = useState({
        user: null,
        start_date: '',
        end_date: '',
        reason: '',
        status: 'APPROVED'
    });

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await axios.get(EMPLOYEES_URL);
            setEmployees(response.data);
        } catch (error) {
            setAlert({ type: 'danger', message: 'Çalışanlar yüklenemedi' });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : 
                    type === 'file' ? files[0] : value
        }));
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        try {
            await axios.post(EMPLOYEES_URL, formData);
            setAlert({ type: 'success', message: 'Çalışan başarıyla eklendi' });
            closeModal('employeeModal');
            resetForm();
            fetchEmployees();
        } catch (error) {
            setAlert({ type: 'danger', message: 'Çalışan eklenemedi' });
        }
    };

    const handleEditEmployee = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${EMPLOYEES_URL}${selectedEmployee.id}/`, formData);
            setAlert({ type: 'success', message: 'Çalışan başarıyla güncellendi' });
            closeModal('employeeModal');
            resetForm();
            fetchEmployees();
        } catch (error) {
            setAlert({ type: 'danger', message: 'Çalışan güncellenemedi' });
        }
    };

    const handleDeleteEmployee = async () => {
        try {
            await axios.delete(`${EMPLOYEES_URL}${selectedEmployee.id}/`);
            setAlert({ type: 'success', message: 'Çalışan başarıyla silindi' });
            closeModal('deleteModal');
            fetchEmployees();
        } catch (error) {
            setAlert({ type: 'danger', message: 'Çalışan silinemedi' });
        }
    };

    const handleLeaveRecord = async (e) => {
        e.preventDefault();
        try {
            await axios.post(LEAVE_REQUEST_URL, leaveFormData);
            setAlert({ type: 'success', message: 'İzin kaydı başarıyla oluşturuldu' });
            closeModal('leaveModal');
            await fetchEmployees();
        } catch (error) {
            setAlert({ type: 'danger', message: 'İzin kaydı oluşturulamadı' });
        }
    };

    const resetForm = () => {
        setFormData({
            username: '',
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            is_employee: false,
            annual_leave_days: 0,
            resume: null
        });
        setSelectedEmployee(null);
    };

    const openAddModal = () => {
        resetForm();
        setModalMode('add');
    };

    const openEditModal = (employee) => {
        setSelectedEmployee(employee);
        setModalMode('edit');
        setFormData({
            username: employee.username,
            first_name: employee.first_name,
            last_name: employee.last_name,
            email: employee.email,
            password: '',
            is_employee: employee.is_employee,
            annual_leave_days: employee.annual_leave_days,
            resume: employee.resume
        });
    };

    const openDeleteModal = (employee) => {
        setSelectedEmployee(employee);
    };

    const closeModal = (modalId) => {
        document.getElementById(modalId).classList.remove('show');
        document.body.classList.remove('modal-open');
        document.querySelector('.modal-backdrop')?.remove();
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Yükleniyor...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            {alert.message && (
                <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
                    {alert.message}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            )}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Çalışan Listesi</h2>
                <button 
                    className="btn btn-primary" 
                    data-bs-toggle="modal" 
                    data-bs-target="#employeeModal"
                    onClick={openAddModal}
                >
                    Yeni Çalışan Ekle
                </button>
            </div>

            <table className="table table-striped table-bordered table-hover table-responsive">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Kullanıcı Adı</th>
                        <th>Ad</th>
                        <th>Soyad</th>
                        <th>E-posta</th>
                        <th>Çalışan mı?</th>
                        <th>Yıllık izin günleri</th>
                        <th>Özgeçmiş</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map((employee) => (
                        <tr key={employee.id}>
                            <td>{employee.id}</td>
                            <td>{employee.username}</td>
                            <td>{employee.first_name}</td>
                            <td>{employee.last_name}</td>
                            <td>{employee.email}</td>
                            <td>{employee.is_employee ? 'Evet' : 'Hayır'}</td>
                            <td>{employee.annual_leave_days}</td>
                            <td>
                                {employee.resume ? (
                                    <a href={employee.resume} target="_blank" rel="noopener noreferrer">
                                        İndir
                                    </a>
                                ) : (
                                    'Yok'
                                )}
                            </td>
                            <td>
                                <button 
                                    className="btn btn-warning btn-sm me-2" 
                                    data-bs-toggle="modal" 
                                    data-bs-target="#employeeModal"
                                    onClick={() => openEditModal(employee)}
                                    data-bs-placement="top" 
                                    title="Düzenle"
                                >
                                    Düzenle
                                </button>
                                <button
                                    className="btn btn-primary btn-sm me-2"
                                    data-bs-toggle="modal"
                                    data-bs-target="#leaveModal"
                                    onClick={() => setLeaveFormData({
                                        ...leaveFormData,
                                        user: employee.id
                                    })}
                                    data-bs-placement="top" 
                                    title="İzin Tanımla"
                                >
                                    İzin Tanımla
                                </button>
                                <button 
                                    className="btn btn-danger btn-sm" 
                                    data-bs-toggle="modal" 
                                    data-bs-target="#deleteModal"
                                    onClick={() => openDeleteModal(employee)}
                                    data-bs-placement="top" 
                                    title="Sil"
                                >
                                    Sil
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div 
                className="modal fade" 
                id="employeeModal" 
                tabIndex="-1" 
                aria-labelledby="employeeModalLabel" 
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="employeeModalLabel">
                                {modalMode === 'add' ? 'Yeni Çalışan Ekle' : 'Çalışanı Düzenle'}
                            </h5>
                            <button 
                                type="button" 
                                className="btn-close" 
                                data-bs-dismiss="modal" 
                                aria-label="Close"
                            ></button>
                        </div>
                        <form onSubmit={modalMode === 'add' ? handleAddEmployee : handleEditEmployee}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="username" className="form-label">Kullanıcı Adı</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="username" 
                                            name="username"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            required 
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="first_name" className="form-label">Ad</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="first_name" 
                                            name="first_name"
                                            value={formData.first_name}
                                            onChange={handleInputChange}
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="last_name" className="form-label">Soyad</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            id="last_name" 
                                            name="last_name"
                                            value={formData.last_name}
                                            onChange={handleInputChange}
                                            required 
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label htmlFor="email" className="form-label">E-posta</label>
                                        <input 
                                            type="email" 
                                            className="form-control" 
                                            id="email" 
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required 
                                        />
                                    </div>
                                </div>
                                {modalMode === 'add' && (
                                    <div className="mb-3">
                                        <label htmlFor="password" className="form-label">Şifre</label>
                                        <input 
                                            type="password" 
                                            className="form-control" 
                                            id="password" 
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required={modalMode === 'add'} 
                                        />
                                    </div>
                                )}
                                <div className="mb-3 form-check">
                                    <input 
                                        type="checkbox" 
                                        className="form-check-input" 
                                        id="is_employee" 
                                        name="is_employee"
                                        checked={formData.is_employee}
                                        onChange={handleInputChange}
                                    />
                                    <label className="form-check-label" htmlFor="is_employee">Aktif Çalışan</label>
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="annual_leave_days" className="form-label">Yıllık İzin Günleri</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        id="annual_leave_days" 
                                        name="annual_leave_days"
                                        value={formData.annual_leave_days}
                                        onChange={handleInputChange}
                                        min="0"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="resume" className="form-label">Özgeçmiş</label>
                                    <input 
                                        type="file" 
                                        className="form-control" 
                                        id="resume" 
                                        name="resume"
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    data-bs-dismiss="modal"
                                >
                                    İptal
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                >
                                    {modalMode === 'add' ? 'Ekle' : 'Güncelle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <div 
                className="modal fade" 
                id="deleteModal" 
                tabIndex="-1" 
                aria-labelledby="deleteModalLabel" 
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="deleteModalLabel">Çalışanı Sil</h5>
                            <button 
                                type="button" 
                                className="btn-close" 
                                data-bs-dismiss="modal" 
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            {selectedEmployee && (
                                <p>
                                    {selectedEmployee.username} adlı çalışanı silmek istediğinizden emin misiniz?
                                </p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button 
                                type="button" 
                                className="btn btn-secondary" 
                                data-bs-dismiss="modal"
                            >
                                İptal
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-danger"
                                onClick={handleDeleteEmployee}
                            >
                                Sil
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div 
                className="modal fade" 
                id="leaveModal" 
                tabIndex="-1" 
                aria-labelledby="leaveModalLabel" 
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="leaveModalLabel">Çalışana İzin Tanımla</h5>
                            <button 
                                type="button" 
                                className="btn-close" 
                                data-bs-dismiss="modal" 
                                aria-label="Close"
                            ></button>
                        </div>
                        <form onSubmit={handleLeaveRecord}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label htmlFor="start_date" className="form-label">Başlangıç Tarihi</label>
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        id="start_date" 
                                        name="start_date"
                                        value={leaveFormData.start_date}
                                        onChange={(e) => setLeaveFormData({
                                            ...leaveFormData,
                                            start_date: e.target.value
                                        })}
                                        required 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="end_date" className="form-label">Bitiş Tarihi</label>
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        id="end_date" 
                                        name="end_date"
                                        value={leaveFormData.end_date}
                                        onChange={(e) => setLeaveFormData({
                                            ...leaveFormData,
                                            end_date: e.target.value
                                        })}
                                        required 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="reason" className="form-label">Sebep</label>
                                    <textarea 
                                        className="form-control" 
                                        id="reason" 
                                        name="reason"
                                        value={leaveFormData.reason}
                                        onChange={(e) => setLeaveFormData({
                                            ...leaveFormData,
                                            reason: e.target.value
                                        })}
                                        required 
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    data-bs-dismiss="modal"
                                >
                                    İptal
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary"
                                >
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { Employees };
