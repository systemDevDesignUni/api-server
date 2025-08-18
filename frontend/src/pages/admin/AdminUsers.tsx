import React, { useState, useRef } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, KeyIcon, UploadIcon, CheckCircleIcon, XCircleIcon, FileIcon, AlertCircleIcon, UsersIcon, CheckIcon, XIcon } from 'lucide-react';
import Button from '../../components/Button';
import { users, courses } from '../../utils/data';
import Papa from 'papaparse';

interface UserFormData {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  status: 'active' | 'inactive';
  assignedCourses: string[];
  paymentStatus: 'paid' | 'unpaid' | 'n/a';
}

interface ImportUserData {
  name: string;
  email: string;
  grade?: string;
  feesPaid: 'paid' | 'unpaid';
  selected: boolean;
  error?: string;
  assignedCourses: string[];
}

const AdminUsers: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    id: '',
    name: '',
    email: '',
    role: 'student',
    status: 'active',
    assignedCourses: [],
    paymentStatus: 'unpaid'
  });
  const [importData, setImportData] = useState<ImportUserData[]>([]);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: number;
    messages: {
      type: 'success' | 'error';
      message: string;
    }[];
  }>({
    success: 0,
    errors: 0,
    messages: []
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenModal = (user: any = null) => {
    if (user) {
      setFormData({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        assignedCourses: user.assignedCourses || [],
        paymentStatus: user.paymentStatus
      });
      setEditingUser(user);
    } else {
      setFormData({
        id: `user${users.length + 1}`,
        name: '',
        email: '',
        role: 'student',
        status: 'active',
        assignedCourses: [],
        paymentStatus: 'unpaid'
      });
      setEditingUser(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));
  };

  const handleCourseChange = (courseId: string) => {
    setFormData(prev => {
      const courseIndex = prev.assignedCourses.indexOf(courseId);
      if (courseIndex > -1) {
        return {
          ...prev,
          assignedCourses: prev.assignedCourses.filter(id => id !== courseId)
        };
      } else {
        return {
          ...prev,
          assignedCourses: [...prev.assignedCourses, courseId]
        };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save the user to a database
    alert(`User ${editingUser ? 'updated' : 'created'}: ${formData.name}`);
    handleCloseModal();
  };

  // Import functionality
  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
    setImportStep('upload');
    setImportData([]);
    setFileName('');
    setIsProcessing(false);
    setImportResults({
      success: 0,
      errors: 0,
      messages: []
    });
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    setImportStep('upload');
    setImportData([]);
    setFileName('');
    setIsProcessing(false);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const normalizeFeesPaid = (value: string): 'paid' | 'unpaid' => {
    if (!value) return 'unpaid';
    const normalized = value.toLowerCase().trim();
    return ['paid', 'true', '1', 'yes'].includes(normalized) ? 'paid' : 'unpaid';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension !== 'csv') {
      alert('Please upload a CSV file only. Excel files are no longer supported for security reasons.');
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false, // Keep as strings for better validation
      delimitersToGuess: [',', '\t', '|', ';'],
      complete: (results) => {
        setIsProcessing(false);
        if (results.errors.length > 0) {
          console.warn('Parse warnings:', results.errors);
        }
        processImportData(results.data);
      },
      error: (error) => {
        setIsProcessing(false);
        console.error('Parse error:', error);
        alert(`Error parsing CSV file: ${error.message}`);
      }
    });
  };

  const processImportData = (data: any[]) => {
    const processedData: ImportUserData[] = data
      .filter(row => {
        // Filter out completely empty rows
        return Object.values(row).some(value => 
          value !== null && value !== undefined && String(value).trim() !== ''
        );
      })
      .map((row, index) => {
        const errors: string[] = [];
        
        // Normalize field names (handle different case variations and whitespace)
        const normalizeKey = (obj: any, possibleKeys: string[]): string => {
          const keys = Object.keys(obj);
          for (const key of keys) {
            const normalizedKey = key.toLowerCase().trim();
            if (possibleKeys.some(pk => normalizedKey.includes(pk))) {
              return String(obj[key] || '').trim();
            }
          }
          return '';
        };

        const name = normalizeKey(row, ['name', 'fullname', 'student_name', 'studentname']);
        const email = normalizeKey(row, ['email', 'email_address', 'emailaddress', 'mail']);
        const grade = normalizeKey(row, ['grade', 'class', 'level', 'year']);
        const feesPaidRaw = normalizeKey(row, ['feespaid', 'fees_paid', 'payment', 'paid', 'payment_status', 'paymentstatus']);
        
        // Validate required fields
        if (!name) errors.push('Missing name');
        if (!email) errors.push('Missing email');
        else if (!validateEmail(email)) errors.push('Invalid email format');

        // Check for duplicate emails in existing users
        if (email && users.some(user => user.email.toLowerCase() === email.toLowerCase())) {
          errors.push('Email already exists');
        }

        // Check for duplicate emails in current import batch
        const duplicateInBatch = data.slice(0, index).some(prevRow => {
          const prevEmail = normalizeKey(prevRow, ['email', 'email_address', 'emailaddress', 'mail']);
          return prevEmail && prevEmail.toLowerCase() === email.toLowerCase();
        });
        
        if (duplicateInBatch) {
          errors.push('Duplicate email in import file');
        }

        const feesPaid = normalizeFeesPaid(feesPaidRaw);

        return {
          name,
          email,
          grade,
          feesPaid,
          selected: errors.length === 0,
          error: errors.length > 0 ? errors.join(', ') : undefined,
          assignedCourses: []
        };
      });

    setImportData(processedData);
    setImportStep('preview');
  };

  const toggleSelectUser = (index: number) => {
    setImportData(prev => {
      const newData = [...prev];
      if (!newData[index].error) {
        newData[index].selected = !newData[index].selected;
      }
      return newData;
    });
  };

  const toggleSelectAll = () => {
    const validUsers = importData.filter(user => !user.error);
    const allValidSelected = validUsers.every(user => user.selected);
    
    setImportData(prev => prev.map(user => ({
      ...user,
      selected: user.error ? false : !allValidSelected
    })));
  };

  const handleCourseAssignment = (userIndex: number, courseId: string) => {
    setImportData(prev => {
      const newData = [...prev];
      const user = newData[userIndex];
      if (!user.assignedCourses.includes(courseId)) {
        user.assignedCourses = [...user.assignedCourses, courseId];
      } else {
        user.assignedCourses = user.assignedCourses.filter(id => id !== courseId);
      }
      return newData;
    });
  };

  const handleImportUsers = async () => {
    setIsProcessing(true);
    
    try {
      const selectedUsers = importData.filter(user => user.selected && !user.error);
      
      // In a real app, you would send this data to your backend API
      // const response = await fetch('/api/users/import', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ users: selectedUsers })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const results = {
        success: selectedUsers.length,
        errors: importData.filter(user => user.error).length,
        messages: [] as { type: 'success' | 'error'; message: string; }[]
      };

      if (selectedUsers.length > 0) {
        results.messages.push({
          type: 'success',
          message: `Successfully imported ${selectedUsers.length} users.`
        });
      }

      if (results.errors > 0) {
        results.messages.push({
          type: 'error',
          message: `${results.errors} users had validation errors and were skipped.`
        });
      }

      // Check for users with payment status "unpaid" but assigned courses
      const unpaidWithCourses = selectedUsers.filter(user => 
        user.feesPaid === 'unpaid' && user.assignedCourses.length > 0
      );
      
      if (unpaidWithCourses.length > 0) {
        results.messages.push({
          type: 'error',
          message: `${unpaidWithCourses.length} unpaid users have courses assigned. Payment verification required.`
        });
      }

      setImportResults(results);
      setImportStep('result');
    } catch (error) {
      console.error('Import error:', error);
      setImportResults({
        success: 0,
        errors: importData.length,
        messages: [{
          type: 'error',
          message: 'Failed to import users. Please try again.'
        }]
      });
      setImportStep('result');
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedCount = importData.filter(user => user.selected && !user.error).length;
  const errorCount = importData.filter(user => user.error).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          User Management
        </h1>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleOpenImportModal}>
            <UploadIcon className="mr-2 w-4 h-4" />
            Import Users
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="mr-2 w-4 h-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-xl border border-gray-200 shadow-sm dark:bg-dark-card dark:border-dark-border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
            <thead className="bg-gray-50 dark:bg-dark-border">
              <tr>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Courses
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                  Payment
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-card dark:divide-dark-border">
              {users.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10">
                        <div className="flex justify-center items-center w-10 h-10 bg-gray-200 rounded-full dark:bg-gray-700">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {user.assignedCourses?.length || 0} courses
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : user.paymentStatus === 'unpaid' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {user.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <PencilIcon className="w-5 h-5" />
                        <span className="sr-only">Edit</span>
                      </button>
                      <button className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300">
                        <KeyIcon className="w-5 h-5" />
                        <span className="sr-only">Reset Password</span>
                      </button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        <TrashIcon className="w-5 h-5" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      {isModalOpen && (
        <div className="overflow-y-auto fixed inset-0 z-50">
          <div className="flex justify-center items-center px-4 pt-4 pb-20 min-h-screen text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block overflow-hidden text-left align-bottom bg-white rounded-lg shadow-xl transition-all transform dark:bg-dark-card sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 bg-white dark:bg-dark-card sm:p-6 sm:pb-4">
                <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900 dark:text-white">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="block px-3 py-2 mt-1 w-full text-gray-900 bg-white rounded-md border border-gray-300 shadow-sm dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-dark-bg dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block px-3 py-2 mt-1 w-full text-gray-900 bg-white rounded-md border border-gray-300 shadow-sm dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-dark-bg dark:text-white"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Role
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="block px-3 py-2 mt-1 w-full text-gray-900 bg-white rounded-md border border-gray-300 shadow-sm dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-dark-bg dark:text-white"
                      >
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </label>
                      <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="block px-3 py-2 mt-1 w-full text-gray-900 bg-white rounded-md border border-gray-300 shadow-sm dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-dark-bg dark:text-white"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  {formData.role === 'student' && (
                    <>
                      <div>
                        <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Payment Status
                        </label>
                        <select
                          id="paymentStatus"
                          name="paymentStatus"
                          value={formData.paymentStatus}
                          onChange={handleChange}
                          className="block px-3 py-2 mt-1 w-full text-gray-900 bg-white rounded-md border border-gray-300 shadow-sm dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-dark-bg dark:text-white"
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Assigned Courses
                        </label>
                        <div className="overflow-y-auto p-2 max-h-40 bg-white rounded-md border border-gray-300 dark:border-gray-600 dark:bg-dark-bg">
                          {courses.map(course => (
                            <div key={course.id} className="flex items-center py-1">
                              <input
                                type="checkbox"
                                id={`course-${course.id}`}
                                checked={formData.assignedCourses.includes(course.id)}
                                onChange={() => handleCourseChange(course.id)}
                                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                              />
                              <label htmlFor={`course-${course.id}`} className="block ml-2 text-sm text-gray-900 dark:text-white">
                                {course.title}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <Button type="submit">
                      {editingUser ? 'Save Changes' : 'Create User'}
                    </Button>
                    <Button type="button" variant="secondary" onClick={handleCloseModal}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Users Modal */}
      {isImportModalOpen && (
        <div className="overflow-y-auto fixed inset-0 z-50">
          <div className="flex justify-center items-center px-4 pt-4 pb-20 min-h-screen text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block overflow-hidden text-left align-bottom bg-white rounded-lg shadow-xl transition-all transform dark:bg-dark-card sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="px-4 pt-5 pb-4 bg-white dark:bg-dark-card sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Import Users
                  </h3>
                  <button
                    type="button"
                    onClick={handleCloseImportModal}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Upload Step */}
                {importStep === 'upload' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-md dark:bg-blue-900/20">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <FileIcon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            Upload CSV File
                          </h3>
                          <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                            <p>
                              File should contain columns for name, email, grade, and feesPaid.
                            </p>
                            <p className="mt-1">
                              Example format:
                              <code className="ml-1 px-1 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs">
                                Name,Email,Grade,FeesPaid
                              </code>
                            </p>
                            <p className="mt-1 text-xs">
                              Note: Excel files are no longer supported for security reasons. Please use CSV format only.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center px-6 pt-5 pb-6 rounded-md border-2 border-gray-300 border-dashed dark:border-gray-600">
                      <div className="space-y-1 text-center">
                        <UploadIcon className="mx-auto w-12 h-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <label
                            htmlFor="file-upload"
                            className="relative font-medium text-indigo-600 bg-white rounded-md cursor-pointer dark:bg-dark-bg hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              ref={fileInputRef}
                              accept=".csv"
                              onChange={handleFileUpload}
                              disabled={isProcessing}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          CSV files only, up to 10MB
                        </p>
                      </div>
                    </div>

                    {fileName && (
                      <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-md dark:bg-indigo-900/20">
                        <div className="flex items-center">
                          <FileIcon className="mr-2 w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                          <span className="text-sm text-indigo-700 dark:text-indigo-300">
                            {fileName}
                          </span>
                        </div>
                        {isProcessing && (
                          <div className="flex items-center">
                            <div className="w-4 h-4 rounded-full border-b-2 border-indigo-600 animate-spin"></div>
                            <span className="ml-2 text-sm text-indigo-600 dark:text-indigo-400">Processing...</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end mt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleCloseImportModal}
                        className="mr-3"
                        disabled={isProcessing}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        disabled={!fileName || isProcessing}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {fileName ? 'Change File' : 'Select File'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Preview Step */}
                {importStep === 'preview' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-md dark:bg-blue-900/20">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircleIcon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            Preview Data
                          </h3>
                          <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                            <p>
                              Review the data below before importing. You can deselect rows with errors or that you don't want to import.
                            </p>
                            <p className="mt-1">
                              Only users with feesPaid status "paid" can be assigned courses.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="p-3 bg-green-50 rounded-md dark:bg-green-900/20">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedCount}</div>
                          <div className="text-xs text-green-600 dark:text-green-400">Selected</div>
                        </div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-md dark:bg-red-900/20">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{errorCount}</div>
                          <div className="text-xs text-red-600 dark:text-red-400">Errors</div>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-md dark:bg-gray-700">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{importData.length}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                      <div className="overflow-x-auto max-h-96">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="sticky top-0 bg-gray-50 dark:bg-dark-border">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    checked={importData.length > 0 && importData.filter(user => !user.error).every(user => user.selected)}
                                    onChange={toggleSelectAll}
                                  />
                                  <span className="ml-2">Select</span>
                                </div>
                              </th>
                              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                                Name
                              </th>
                              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                                Email
                              </th>
                              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                                Grade
                              </th>
                              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                                Fees Paid
                              </th>
                              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-card dark:divide-gray-700">
                            {importData.map((user, index) => (
                              <tr key={index} className={user.error ? 'bg-red-50 dark:bg-red-900/10' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    disabled={!!user.error}
                                    checked={user.selected}
                                    onChange={() => toggleSelectUser(index)}
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 disabled:opacity-50"
                                  />
                                </td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                  {user.name || (
                                    <span className="text-red-500 dark:text-red-400">Missing</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                                  {user.email || (
                                    <span className="text-red-500 dark:text-red-400">Missing</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                                  {user.grade || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    user.feesPaid === 'paid' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                  }`}>
                                    {user.feesPaid}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {user.error ? (
                                    <div className="flex items-center">
                                      <XCircleIcon className="mr-1 w-5 h-5 text-red-500 dark:text-red-400" />
                                      <span className="text-xs text-red-500 dark:text-red-400">
                                        {user.error}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center">
                                      <CheckCircleIcon className="mr-1 w-5 h-5 text-green-500 dark:text-green-400" />
                                      <span className="text-xs text-green-500 dark:text-green-400">
                                        Valid
                                      </span>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Course Assignment Section */}
                    <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                        Assign Courses (Only for Paid Users)
                      </h4>
                      <div className="grid overflow-y-auto grid-cols-1 gap-4 max-h-64 md:grid-cols-2">
                        {importData
                          .filter(user => user.selected && !user.error && user.feesPaid === 'paid')
                          .map((user, userIndex) => (
                            <div key={userIndex} className="p-3 rounded-md border border-gray-200 dark:border-gray-700">
                              <div className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                {user.name} ({user.email})
                              </div>
                              <div className="overflow-y-auto space-y-1 max-h-32">
                                {courses.map(course => (
                                  <div key={course.id} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`user-${userIndex}-course-${course.id}`}
                                      checked={user.assignedCourses.includes(course.id)}
                                      onChange={() => handleCourseAssignment(
                                        importData.findIndex(u => u.email === user.email),
                                        course.id
                                      )}
                                      className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                    />
                                    <label
                                      htmlFor={`user-${userIndex}-course-${course.id}`}
                                      className="block ml-2 text-xs text-gray-800 dark:text-gray-200"
                                    >
                                      {course.title}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        {importData.filter(user => user.selected && !user.error && user.feesPaid === 'paid').length === 0 && (
                          <div className="col-span-2 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                            No paid users selected for course assignment
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setImportStep('upload')}
                        className="mr-3"
                        disabled={isProcessing}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={handleImportUsers}
                        disabled={selectedCount === 0 || isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <div className="mr-2 w-4 h-4 rounded-full border-b-2 border-white animate-spin"></div>
                            Importing...
                          </>
                        ) : (
                          `Import ${selectedCount} Users`
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Result Step */}
                {importStep === 'result' && (
                  <div className="space-y-4">
                    <div className="py-4 text-center">
                      {importResults.success > 0 ? (
                        <div className="flex justify-center items-center mx-auto w-12 h-12 bg-green-100 rounded-full dark:bg-green-900/30">
                          <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="flex justify-center items-center mx-auto w-12 h-12 bg-red-100 rounded-full dark:bg-red-900/30">
                          <XIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                      )}
                      <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
                        Import Complete
                      </h3>
                      <div className="mt-2 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Successfully imported {importResults.success} users.
                          {importResults.errors > 0 && ` ${importResults.errors} users had errors.`}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-md border border-gray-200 divide-y divide-gray-200 dark:border-gray-700 dark:divide-gray-700">
                      {importResults.messages.map((message, index) => (
                        <div
                          key={index}
                          className={`p-4 flex ${
                            message.type === 'error' 
                              ? 'bg-red-50 dark:bg-red-900/10' 
                              : 'bg-green-50 dark:bg-green-900/10'
                          }`}
                        >
                          {message.type === 'error' ? (
                            <XCircleIcon className="mr-3 w-5 h-5 text-red-400 dark:text-red-500" />
                          ) : (
                            <CheckCircleIcon className="mr-3 w-5 h-5 text-green-400 dark:text-green-500" />
                          )}
                          <p className={`text-sm ${
                            message.type === 'error' 
                              ? 'text-red-700 dark:text-red-400' 
                              : 'text-green-700 dark:text-green-400'
                          }`}>
                            {message.message}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end mt-4">
                      <Button type="button" onClick={handleCloseImportModal}>
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;