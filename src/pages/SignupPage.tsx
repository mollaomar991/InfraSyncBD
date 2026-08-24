import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingButton from '../components/LoadingButton';
import { useApp } from '../context/AppContext';
import type { RegistrationInput, Role } from '../types';
import styles from './AuthPages.module.css';

interface SignupRole {
  role: Role;
  label: string;
  icon: string;
  note: string;
}

const signupRoles: SignupRole[] = [
  {
    role: 'super_admin',
    label: 'Super Admin',
    icon: '◆',
    note: 'Manage users and system access',
  },
  {
    role: 'citizen',
    label: 'Citizen',
    icon: '●',
    note: 'View infrastructure projects and GIS map',
  },
  {
    role: 'department_officer',
    label: 'Department Officer',
    icon: '▣',
    note: 'Requires Super Admin verification',
  },
  {
    role: 'contractor',
    label: 'Contractor',
    icon: '▲',
    note: 'Requires license verification',
  },
];

const emptyForm: RegistrationInput & { confirmPassword: string } = {
  role: 'citizen',
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  companyName: '',
  department: 'Road Department',
  designation: '',
  employeeId: '',
  officeLocation: '',
  tradeLicense: '',
  contractorLicense: '',
  companyAddress: '',
  previousExperience: '',
  equipmentInformation: '',
  employeeInformation: '',
};

function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, departments } = useApp();
  const navigate = useNavigate();

  const selectedRole = signupRoles.find((item) => item.role === form.role)!;

  function chooseRole(role: Role) {
    setForm((currentForm) => ({ ...currentForm, role }));
    setStep(2);
    setError('');
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (form.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Password and confirmation do not match.');
      return;
    }

    setLoading(true);

    window.setTimeout(async () => {
      const result = await register(form);
      setLoading(false);

      if (!result.success) {
        setError(result.message);
        return;
      }

      setSuccess(result.message);
      window.setTimeout(() => navigate('/login'), 1800);
    }, 1250);
  }

  return (
    <div className={styles.screen}>
      <section className={styles.showcase}>
        <div className={styles.brand}>
          <img src="/InfraSync.png" alt="Logo" className={styles.brandMark} />
          <div>
            <strong>
              InfraSync <span>BD</span>
            </strong>
            <small>One platform · four responsible roles</small>
          </div>
        </div>

        <div className={styles.hero}>
          <div className={styles.badge}>
            <span /> Create your project account
          </div>
          <h1>
            Join the shared
            <br />
            <em>road plan.</em>
          </h1>
          <p>
            Super Admin and Citizen accounts receive immediate access. Government
            officers and contractors submit evidence for Super Admin verification
            before operational access is enabled.
          </p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>1</span>
              <div>
                <strong>Select your role</strong>
                <small>Only role-relevant fields are displayed.</small>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>2</span>
              <div>
                <strong>Submit required information</strong>
                <small>Officer and contractor accounts include proof documents.</small>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>3</span>
              <div>
                <strong>Receive account status</strong>
                <small>Verified roles activate after Super Admin review.</small>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.road} aria-hidden="true" />
        <div className={styles.cone} aria-hidden="true" />
        <div className={styles.coneSmall} aria-hidden="true" />

        <div className={styles.showcaseFooter}>
          <span>Role-based registration workflow</span>
          <strong>Typed React forms</strong>
        </div>
      </section>

      <section className={styles.formSide}>
        <div className={`${styles.card} ${styles.cardLarge}`}>
          <div className={styles.hazardBar} />
          <div className={styles.systemStatus}>
            <span /> Registration service online
          </div>

          <div className={styles.heading}>
            <span>New user registration</span>
            <h2>{step === 1 ? 'Choose your role' : 'Create your account'}</h2>
            <p>
              {step === 1
                ? 'Start by selecting how you will use InfraSync BD.'
                : 'Complete the fields required for your selected role.'}
            </p>
          </div>

          {step === 1 ? (
            <div className={styles.roleGrid}>
              {signupRoles.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  className={styles.roleButton}
                  onClick={() => chooseRole(item.role)}
                >
                  <span className={styles.roleIcon}>{item.icon}</span>
                  <span className={styles.roleText}>
                    <strong>{item.label}</strong>
                    <small>{item.note}</small>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.stepHeader}>
                <div>
                  <span>Selected role</span>
                  <strong>{selectedRole.label}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                    setSuccess('');
                  }}
                >
                  CHANGE ROLE
                </button>
              </div>

              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>
                    {form.role === 'contractor'
                      ? 'Representative name'
                      : 'Full name'}
                  </span>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>N</span>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </label>

                <label className={styles.field}>
                  <span>Email address</span>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>@</span>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                      required
                    />
                  </div>
                </label>

                <label className={styles.field}>
                  <span>Phone number</span>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>T</span>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="01XXXXXXXXX"
                      required
                    />
                  </div>
                </label>

                {form.role === 'department_officer' && (
                  <>
                    <label className={styles.field}>
                      <span>Employee ID</span>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>ID</span>
                        <input
                          name="employeeId"
                          value={form.employeeId}
                          onChange={handleChange}
                          placeholder="Official employee ID"
                          required
                        />
                      </div>
                    </label>

                    <label className={styles.field}>
                      <span>Department</span>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>D</span>
                        <select
                          name="department"
                          value={form.department}
                          onChange={handleChange}
                        >
                          {departments.map((department) => (
                            <option key={department.id} value={department.name}>
                              {department.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </label>

                    <label className={styles.field}>
                      <span>Job designation</span>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>J</span>
                        <input
                          name="designation"
                          value={form.designation}
                          onChange={handleChange}
                          placeholder="Executive Engineer"
                          required
                        />
                      </div>
                    </label>

                    <label className={`${styles.field} ${styles.full}`}>
                      <span>Office location</span>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>⌖</span>
                        <input
                          name="officeLocation"
                          value={form.officeLocation}
                          onChange={handleChange}
                          placeholder="Enter official office address"
                          required
                        />
                      </div>
                    </label>
                  </>
                )}

                {form.role === 'contractor' && (
                  <>
                    <label className={styles.field}>
                      <span>Company name</span>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>C</span>
                        <input
                          name="companyName"
                          value={form.companyName}
                          onChange={handleChange}
                          placeholder="Registered company name"
                          required
                        />
                      </div>
                    </label>

                    <label className={styles.field}>
                      <span>Trade license number</span>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>L</span>
                        <input
                          name="tradeLicense"
                          value={form.tradeLicense}
                          onChange={handleChange}
                          placeholder="Trade license"
                          required
                        />
                      </div>
                    </label>

                    <label className={`${styles.field} ${styles.full}`}>
                      <span>Contractor license number</span>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>CL</span>
                        <input
                          name="contractorLicense"
                          value={form.contractorLicense}
                          onChange={handleChange}
                          placeholder="Government contractor license"
                          required
                        />
                      </div>
                    </label>

                    <label className={`${styles.field} ${styles.full}`}>
                      <span>Company office address</span>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>⌖</span>
                        <input
                          name="companyAddress"
                          value={form.companyAddress}
                          onChange={handleChange}
                          placeholder="Registered office address"
                          required
                        />
                      </div>
                    </label>

                    <label className={`${styles.field} ${styles.full}`}>
                      <span>Previous project experience</span>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>E</span>
                        <textarea
                          name="previousExperience"
                          value={form.previousExperience}
                          onChange={handleChange}
                          placeholder="Summarize relevant completed infrastructure projects"
                          rows={3}
                          required
                        />
                      </div>
                    </label>

                    <label className={styles.field}>
                      <span>Equipment information</span>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>▲</span>
                        <textarea
                          name="equipmentInformation"
                          value={form.equipmentInformation}
                          onChange={handleChange}
                          placeholder="Excavators, rollers, safety equipment..."
                          rows={3}
                          required
                        />
                      </div>
                    </label>

                    <label className={styles.field}>
                      <span>Employee information</span>
                      <div className={styles.inputWrap}>
                        <span className={styles.inputIcon}>P</span>
                        <textarea
                          name="employeeInformation"
                          value={form.employeeInformation}
                          onChange={handleChange}
                          placeholder="Engineers, supervisors, skilled workers..."
                          rows={3}
                          required
                        />
                      </div>
                    </label>
                  </>
                )}

                <label className={styles.field}>
                  <span>Password</span>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>●</span>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Minimum 6 characters"
                      required
                    />
                  </div>
                </label>

                <label className={styles.field}>
                  <span>Confirm password</span>
                  <div className={styles.inputWrap}>
                    <span className={styles.inputIcon}>✓</span>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      required
                    />
                  </div>
                </label>

                {(form.role === 'department_officer' ||
                  form.role === 'contractor') && (
                  <label className={`${styles.field} ${styles.full}`}>
                    <span>Verification documents</span>
                    <div className={styles.inputWrap}>
                      <span className={styles.inputIcon}>↑</span>
                      <input type="file" multiple required />
                    </div>
                    <small className={styles.uploadHelp}>
                      Demo selection only. Files are not uploaded because this
                      package is a frontend project without a backend server.
                    </small>
                  </label>
                )}
              </div>

              {error && (
                <div className={`${styles.alert} ${styles.alertError}`}>
                  <strong>!</strong>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className={`${styles.alert} ${styles.alertSuccess}`}>
                  <strong>✓</strong>
                  <span>{success}</span>
                </div>
              )}

              <LoadingButton
                type="submit"
                fullWidth
                loading={loading}
                loadingText="Submitting registration…"
              >
                Create account
              </LoadingButton>

              {loading && (
                <div className={styles.process}>
                  <div className={styles.processTrack}>
                    <span />
                  </div>
                  <p>Validating fields and preparing account status…</p>
                </div>
              )}
            </form>
          )}

          <p className={styles.switch}>
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </section>
    </div>
  );
}

export default SignupPage;
