# Production Smoke Test Checklist

**URL:** https://nexora-web-amber.vercel.app

Execute this exactly as written, checking off boxes as you go, to prove the entire product loop on the live production environment. If you hit the Render cold start (initial loading spinner takes ~30s-50s), note it—this is expected behavior for the free tier.

## 1. Candidate Onboarding
- [ ] Sign up as a new Candidate (e.g., `demo-candidate@example.com`).
- [ ] Complete the Profile Setup.
- [ ] Upload a test resume (PDF/DOCX).
- [ ] Wait for parsing to complete successfully (status turns green).
- [ ] Verify the ATS score and breakdown are visible.

## 2. Recruiter Job Posting
- [ ] Open an incognito window or use a different browser.
- [ ] Sign up as a new Recruiter (e.g., `demo-recruiter@example.com`).
- [ ] Complete the Company Onboarding form.
- [ ] Create a new Job Post that matches the skills on your test resume.
- [ ] Verify the job appears in the Recruiter Dashboard.

## 3. Discovery & Application
- [ ] Switch back to the Candidate browser.
- [ ] Go to the Jobs tab.
- [ ] Verify the new job appears in the "Recommended" section (or is searchable).
- [ ] Click the job to view the detailed Fit Analysis.
- [ ] Verify the semantic, skill, and experience match bars are populated.
- [ ] Click Apply.
- [ ] Go to the Applications tab and verify the application is listed.

## 4. Shortlisting & Interview Prep
- [ ] Switch back to the Recruiter browser.
- [ ] Go to the Job's applicant list.
- [ ] Verify the candidate appears, ranked by their match score.
- [ ] Click the candidate to open the Applicant Detail Drawer.
- [ ] Change their status to "Shortlisted".
- [ ] Click "Generate Interview Prep".
- [ ] Verify 8 targeted questions are generated based on the gap analysis.

## 5. Candidate Interview Visibility
- [ ] Switch back to the Candidate browser.
- [ ] Go to the Applications tab.
- [ ] Verify the status now says "Shortlisted".
- [ ] Verify the 8 interview prep questions are visible to the candidate.
