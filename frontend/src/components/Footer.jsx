import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Mail, Phone, MapPin, Heart, Shield, FileText, X } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [modalContent, setModalContent] = useState(null);

  const openLegalModal = (title, content) => {
    setModalContent({ title, content });
  };

  const closeModal = () => {
    setModalContent(null);
  };

  return (
    <>
      <footer className="footer" role="contentinfo">
        <div className="footer-container">
          <div className="footer-grid">
            {/* Col 1: Brand & Problem Statement */}
            <div>
              <Link
                to="/"
                className="nav-brand"
                id="footer-logo"
                style={{ marginBottom: '1rem', display: 'inline-flex' }}
              >
                <div className="nav-logo-icon">
                  <Wallet size={18} />
                </div>
                <span>SpendWise</span>
              </Link>
              <p style={{ marginBottom: '1.25rem', lineHeight: '1.6' }}>
                A modern full-stack personal finance and expense management platform built
                for B.Tech CSE Full Stack Development - 2 (FSD-2). Track transactions, set
                monthly budgets, and achieve spending clarity.
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>Academic Project</span>
                <span>•</span>
                <span>React + Express + MongoDB</span>
              </div>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <h4 className="footer-col-title">Navigation</h4>
              <ul className="footer-links-list">
                <li>
                  <Link to="/" id="footer-link-home">Home</Link>
                </li>
                <li>
                  <Link to="/dashboard" id="footer-link-dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link to="/transactions" id="footer-link-transactions">Transactions</Link>
                </li>
                <li>
                  <Link to="/budgets" id="footer-link-budgets">Budgets</Link>
                </li>
                <li>
                  <Link to="/reports" id="footer-link-reports">Reports & Analytics</Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Academic & Legal */}
            <div>
              <h4 className="footer-col-title">Resources & Legal</h4>
              <ul className="footer-links-list">
                <li>
                  <button
                    onClick={() =>
                      openLegalModal(
                        'Privacy Policy',
                        'SpendWise is committed to privacy. All session data, passwords, and transaction details are encrypted using industry-standard bcrypt hashing and stored securely in MongoDB with strict user-level access isolation.'
                      )
                    }
                    style={{ color: 'var(--text-secondary)', padding: 0 }}
                    id="footer-privacy-btn"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      openLegalModal(
                        'Terms of Service',
                        'SpendWise is designed for personal expense tracking and educational demonstration. Users retain full ownership and control over their recorded transaction history and can delete their account at any time.'
                      )
                    }
                    style={{ color: 'var(--text-secondary)', padding: 0 }}
                    id="footer-terms-btn"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      openLegalModal(
                        'System Architecture & Stack',
                        'This application is engineered with: 1. React 18 functional components, modern hooks (useState, useEffect, useContext), and React Router; 2. Node.js & Express RESTful APIs with routing and custom middleware; 3. MongoDB & Mongoose schemas, validation, and aggregation pipelines; 4. Stateful cookie session management; 5. Secure password hashing with bcrypt.'
                      )
                    }
                    style={{ color: 'var(--text-secondary)', padding: 0 }}
                    id="footer-syllabus-btn"
                  >
                    System Architecture
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Contact Information (Clickable Tel & Mailto) */}
            <div>
              <h4 className="footer-col-title">Contact Support</h4>
              <ul className="footer-links-list">
                <li>
                  <a
                    href="mailto:support@spendwise.edu"
                    id="footer-email-link"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Mail size={16} color="var(--accent-primary)" />
                    <span>support@spendwise.edu</span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+919876543210"
                    id="footer-phone-link"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Phone size={16} color="var(--accent-primary)" />
                    <span>+91 98765 43210</span>
                  </a>
                </li>
                <li
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9rem',
                  }}
                >
                  <MapPin size={16} color="var(--accent-primary)" />
                  <span>CSE Dept, Engineering College</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom with Dynamic Year */}
          <div className="footer-bottom">
            <div>
              &copy; {currentYear} SpendWise. Developed for Full Stack Development - 2
              Laboratory Examination. All rights reserved.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Engineered with</span>
              <Heart size={14} color="var(--accent-danger)" fill="var(--accent-danger)" />
              <span>for Academic Excellence</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal for Privacy, Terms, and Syllabus */}
      {modalContent && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={20} color="var(--accent-primary)" />
                {modalContent.title}
              </h3>
              <button onClick={closeModal} className="icon-button" aria-label="Close modal">
                <X size={18} />
              </button>
            </div>
            <p style={{ lineHeight: '1.6', marginBottom: '1.5rem' }}>
              {modalContent.content}
            </p>
            <div className="modal-footer">
              <button onClick={closeModal} className="btn btn-primary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
