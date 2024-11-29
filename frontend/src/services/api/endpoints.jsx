
export const BASE_API_URL = 'http://localhost:8000/api/v1/';

export const LOGIN_URL = `${BASE_API_URL}login/`;
export const USER_BY_TOKEN_URL = `${BASE_API_URL}user/`;

export const CHECK_IN_URL = `${BASE_API_URL}check-in/`;
export const CHECK_OUT_URL = `${BASE_API_URL}check-out/`;
export const LATE_ARRIVALS_URL = `${BASE_API_URL}late-arrivals/`;

export const EMPLOYEES_URL = `${BASE_API_URL}employees/`;
export const ATTENDANCES_URL = `${BASE_API_URL}attendances/`;
export const MONTHLY_WORK_REPORT_URL = `${BASE_API_URL}monthly-work-report/`;

export const LEAVE_REQUEST_URL = `${BASE_API_URL}leave-requests/`;
export const APPROVE_LEAVE_URL = `${BASE_API_URL}leave-requests/approve/`;
export const REJECT_LEAVE_URL = `${BASE_API_URL}leave-requests/reject/`;
export const PENDING_LEAVES_URL = `${BASE_API_URL}pending-leaves/`;

export const WS_NOTIFICATIONS_URL = 'ws://127.0.0.1:8000/ws/notifications/';