import React, { useState } from 'react';
import { User, Lock, Bell, Globe, Palette, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';


// ── Password Strength ──────────────────────────────────────────────────────
const getStrength = (pwd: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (pwd.length >= 8)           score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (pwd.length >= 12)          score++;
  const levels = [
    { label: '',            color: 'bg-gray-200'   },
    { label: 'Very Weak',   color: 'bg-red-500'    },
    { label: 'Weak',        color: 'bg-orange-400' },
    { label: 'Fair',        color: 'bg-yellow-400' },
    { label: 'Strong',      color: 'bg-blue-500'   },
    { label: 'Very Strong', color: 'bg-green-500'  },
  ];
  return { score, ...levels[score] };
};

const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <div className="space-y-1.5 mt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? color : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${
        score <= 1 ? 'text-red-500'    : score <= 2 ? 'text-orange-500' :
        score === 3 ? 'text-yellow-600' : score === 4 ? 'text-blue-600' : 'text-green-600'
      }`}>
        {label && `Password strength: ${label}`}
      </p>
    </div>
  );
};

// ── Password Section ───────────────────────────────────────────────────────
const PasswordSection: React.FC = () => {
  const [current, setCurrent] = useState('');
  const [newPwd,  setNewPwd]  = useState('');
  const [confirm, setConfirm] = useState('');
  const [saved,   setSaved]   = useState(false);

  const handleSave = () => {
    if (!current || !newPwd || newPwd !== confirm) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setCurrent(''); setNewPwd(''); setConfirm('');
  };

  return (
    <div className="space-y-4">
      <Input
        label="Current Password"
        type="password"
        value={current}
        onChange={e => setCurrent(e.target.value)}
        fullWidth
      />
      <div>
        <Input
          label="New Password"
          type="password"
          value={newPwd}
          onChange={e => setNewPwd(e.target.value)}
          fullWidth
        />
        <PasswordStrengthMeter password={newPwd} />
      </div>
      <Input
        label="Confirm New Password"
        type="password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        fullWidth
      />
      {confirm && newPwd !== confirm && (
        <p className="text-xs text-red-500">Passwords do not match</p>
      )}
      {saved && (
        <p className="text-xs text-green-600 font-medium">✓ Password updated successfully!</p>
      )}
      <div className="flex justify-end">
        <Button onClick={handleSave}>Update Password</Button>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings navigation */}
        <Card className="lg:col-span-1">
          <CardBody className="p-2">
            <nav className="space-y-1">
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-md">
                <User size={18} className="mr-3" /> Profile
              </button>
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Lock size={18} className="mr-3" /> Security
              </button>
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Bell size={18} className="mr-3" /> Notifications
              </button>
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Globe size={18} className="mr-3" /> Language
              </button>
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <Palette size={18} className="mr-3" /> Appearance
              </button>
              <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md">
                <CreditCard size={18} className="mr-3" /> Billing
              </button>
            </nav>
          </CardBody>
        </Card>

        {/* Main settings content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar src={user.avatarUrl} alt={user.name} size="xl" />
                <div>
                  <Button variant="outline" size="sm">Change Photo</Button>
                  <p className="mt-2 text-sm text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Full Name"      defaultValue={user.name}  />
                <Input label="Email" type="email" defaultValue={user.email} />
                <Input label="Role"  value={user.role} disabled />
                <Input label="Location" defaultValue="San Francisco, CA" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  rows={4}
                  defaultValue={user.bio}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardBody>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              {/* 2FA */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-sm text-gray-700 font-medium">Authenticator App</p>
                    <p className="text-xs text-gray-500 mt-0.5">Add an extra layer of security</p>
                    <Badge variant="error" className="mt-2">Not Enabled</Badge>
                  </div>
                  <Button variant="outline" leftIcon={<Lock size={16} />}>Enable 2FA</Button>
                </div>
              </div>

              {/* Change Password */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>
                <PasswordSection />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};