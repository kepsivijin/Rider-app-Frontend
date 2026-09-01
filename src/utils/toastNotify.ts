import toast from 'react-hot-toast';

const DURATION_MS = 3000;

/** Show one toast at a time, auto-dismiss after 3 seconds */
export function notifySuccess(message: string, id?: string) {
  toast.dismiss();
  toast.success(message, { id: id || message, duration: DURATION_MS });
}

export function notifyError(message: string, id?: string) {
  toast.dismiss();
  toast.error(message, { id: id || message, duration: DURATION_MS });
}

export function notifyInfo(message: string, id?: string) {
  toast.dismiss();
  toast(message, { id: id || message, duration: DURATION_MS });
}
