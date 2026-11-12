import { FormEvent, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../services/api';
import { getErrorMessage } from '../../utils/errors';

export function Profile() {
  const { user, updateProfile } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    street: user?.address?.street ?? '',
    city: user?.address?.city ?? '',
    state: user?.address?.state ?? '',
    postalCode: user?.address?.postalCode ?? '',
    country: user?.address?.country ?? 'Pakistan',
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        address: {
          street: profileForm.street,
          city: profileForm.city,
          state: profileForm.state,
          postalCode: profileForm.postalCode,
          country: profileForm.country,
        },
      });
    } catch {
      /* toast in context */
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePassword = async (e: FormEvent) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      toast.success('Password updated');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Password update failed'));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="container py-4 py-lg-5">
      <h1 className="h2 fw-bold mb-4">My Profile</h1>
      <div className="row g-4">
        <div className="col-lg-7">
          <form className="card border-0 shadow-sm p-4" onSubmit={(e) => void handleProfile(e)}>
            <h2 className="h5 fw-semibold mb-3">Account details</h2>
            <div className="mb-3">
              <label className="form-label" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                className="form-control"
                value={profileForm.name}
                onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" value={user?.email ?? ''} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                className="form-control"
                value={profileForm.phone}
                onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <h3 className="h6 fw-semibold mt-2 mb-3">Address</h3>
            {(['street', 'city', 'state', 'postalCode', 'country'] as const).map((field) => (
              <div className="mb-3" key={field}>
                <label className="form-label" htmlFor={field}>
                  {field === 'postalCode' ? 'Postal code' : field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  id={field}
                  className="form-control"
                  value={profileForm[field]}
                  onChange={(e) => setProfileForm((f) => ({ ...f, [field]: e.target.value }))}
                />
              </div>
            ))}
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </div>
        <div className="col-lg-5">
          <form className="card border-0 shadow-sm p-4" onSubmit={(e) => void handlePassword(e)}>
            <h2 className="h5 fw-semibold mb-3">Change password</h2>
            <div className="mb-3">
              <label className="form-label" htmlFor="currentPassword">
                Current password
              </label>
              <input
                id="currentPassword"
                type="password"
                className="form-control"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
              />
            </div>
            <div className="mb-4">
              <label className="form-label" htmlFor="newPassword">
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                className="form-control"
                required
                minLength={6}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn btn-outline-primary" disabled={savingPassword}>
              {savingPassword ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
