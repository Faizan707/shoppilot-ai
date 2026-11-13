import { IoClose } from 'react-icons/io5';
import {
  ToastContainer as BaseToastContainer,
  toast as baseToast,
  type ToastOptions,
  type CloseButtonProps,
} from 'react-toastify';

type ToastTone = 'default' | 'success' | 'error' | 'info';

interface ToastContentProps {
  title: string;
  description?: string;
}

function ToastContent({ title, description }: ToastContentProps) {
  return (
    <div className="sp-toast">
      <p className="sp-toast-title">{title}</p>
      {description ? <p className="sp-toast-desc">{description}</p> : null}
    </div>
  );
}

function CloseButton({ closeToast }: CloseButtonProps) {
  return (
    <button
      type="button"
      className="sp-toast-close"
      onClick={(event) => {
        event.stopPropagation();
        closeToast(event);
      }}
      aria-label="Dismiss notification"
    >
      <IoClose size={15} />
    </button>
  );
}

const baseOptions: ToastOptions = {
  icon: false,
  hideProgressBar: true,
  closeButton: CloseButton,
  className: 'sp-toastify',
};

function show(tone: ToastTone, title: string, description?: string, options?: ToastOptions) {
  const content = <ToastContent title={title} description={description} />;
  const merged: ToastOptions = {
    ...baseOptions,
    ...options,
    className: `sp-toastify sp-toastify--${tone} ${options?.className ?? ''}`.trim(),
  };

  switch (tone) {
    case 'success':
      return baseToast.success(content, merged);
    case 'error':
      return baseToast.error(content, merged);
    case 'info':
      return baseToast.info(content, merged);
    default:
      return baseToast(content, merged);
  }
}

export const toast = {
  success: (title: string, description?: string, options?: ToastOptions) =>
    show('success', title, description, options),
  error: (title: string, description?: string, options?: ToastOptions) =>
    show('error', title, description, options),
  info: (title: string, description?: string, options?: ToastOptions) =>
    show('info', title, description, options),
  message: (title: string, description?: string, options?: ToastOptions) =>
    show('default', title, description, options),
};

export function AppToastContainer() {
  return (
    <BaseToastContainer
      position="bottom-right"
      autoClose={4000}
      newestOnTop
      closeOnClick={false}
      pauseOnHover
      draggable={false}
      theme="light"
      limit={4}
      toastClassName={() => 'Toastify__toast sp-toastify'}
      closeButton={CloseButton}
      hideProgressBar
      icon={false}
    />
  );
}
