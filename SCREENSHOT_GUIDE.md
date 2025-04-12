# Screenshot Guide for TrustVote User Manual

This document provides guidance on where to place screenshots in the TrustVote User Manual. When taking screenshots, ensure they are clear, properly sized, and annotated where necessary. Replace placeholder references in the USER_MANUAL.md file with actual screenshots.

## Required Screenshots

### Getting Started Section

1. **Registration Page**
   - Filename: `screenshots/registration_page.png`
   - Description: Screenshot of the registration form with all fields visible
   - Placement: After "Creating an Account" step 2

2. **Login Page**
   - Filename: `screenshots/login_page.png`
   - Description: Screenshot of the login page
   - Placement: After "Logging In" step 2

3. **Connect Wallet**
   - Filename: `screenshots/connect_wallet.png`
   - Description: Screenshot showing the wallet connection interface and MetaMask popup
   - Placement: After "Connecting Your Wallet" step 2

### Voter Guide Section

4. **Elections List**
   - Filename: `screenshots/elections_list.png`
   - Description: Screenshot of the Elections page showing multiple election cards
   - Placement: After "Viewing Available Elections" step 2

5. **Election Details**
   - Filename: `screenshots/election_details.png`
   - Description: Screenshot of an individual election's detail page
   - Placement: After "Participating in an Election" step 2

6. **Voting Interface**
   - Filename: `screenshots/voting_interface.png`
   - Description: Screenshot of the voting interface showing position and candidate selection
   - Placement: After "Casting Your Vote" step 2

7. **Vote Confirmation**
   - Filename: `screenshots/vote_confirmation.png`
   - Description: Screenshot of the vote confirmation page showing transaction details
   - Placement: After "Verifying Your Vote" step 1

8. **Election Results**
   - Filename: `screenshots/election_results.png`
   - Description: Screenshot of the results page with charts and winner indicators
   - Placement: After "Viewing Election Results" step 3

9. **User Profile**
   - Filename: `screenshots/user_profile.png`
   - Description: Screenshot of the user profile page with editable fields
   - Placement: After "Managing Your Profile" step 2

10. **Voting History**
    - Filename: `screenshots/voting_history.png`
    - Description: Screenshot of the voting history section in the user profile
    - Placement: After "Viewing Your Voting History" step 2

### Administrator Guide Section

11. **Admin Dashboard**
    - Filename: `screenshots/admin_dashboard.png`
    - Description: Screenshot of the main admin dashboard with statistics
    - Placement: After "Dashboard Overview" step 3

12. **Create Election Form**
    - Filename: `screenshots/create_election.png`
    - Description: Screenshot of the election creation form
    - Placement: After "Creating a New Election" step 3

13. **Election Management**
    - Filename: `screenshots/election_management.png`
    - Description: Screenshot of the election management interface
    - Placement: After "Managing Elections" step 2

14. **Add Candidate Form**
    - Filename: `screenshots/add_candidate.png`
    - Description: Screenshot of the form for adding a new candidate
    - Placement: After "Adding Candidates" step 3

15. **Voter Management**
    - Filename: `screenshots/voter_management.png`
    - Description: Screenshot of the voter whitelist management interface
    - Placement: After "Managing Voters" step 2

16. **Election Monitoring**
    - Filename: `screenshots/election_monitoring.png`
    - Description: Screenshot of the real-time election monitoring dashboard
    - Placement: After "Monitoring Election Status" step 2

17. **Analytics Dashboard**
    - Filename: `screenshots/analytics_dashboard.png`
    - Description: Screenshot of the analytics dashboard with charts and graphs
    - Placement: After "Viewing Analytics" step 2

18. **Close Election Interface**
    - Filename: `screenshots/close_election.png`
    - Description: Screenshot of the interface for closing an election
    - Placement: After "Closing Elections" step 2

## Technical Notes

1. **Blockchain Transaction View**
   - Filename: `screenshots/blockchain_transaction.png`
   - Description: Screenshot of a vote transaction on Etherscan
   - Placement: In "Technical Background" section, under "Blockchain Integration"

2. **Smart Contract Structure**
   - Filename: `screenshots/smart_contract_structure.png`
   - Description: Diagram showing the relationship between ElectionFactory and Election contracts
   - Placement: In "Smart Contract Architecture" section

## Troubleshooting Section

1. **MetaMask Error**
   - Filename: `screenshots/metamask_error.png`
   - Description: Screenshot of a common MetaMask connection error
   - Placement: In "Common Issues for Voters" section, under "Cannot Connect Wallet"

2. **Transaction Failed**
   - Filename: `screenshots/transaction_failed.png`
   - Description: Screenshot of a failed transaction error
   - Placement: In "Common Issues for Voters" section, under "Transaction Failed"

## Instructions for Adding Screenshots to the Manual

When finalizing the USER_MANUAL.md document:

1. Replace textual references to screenshots with actual image markdown:
   ```markdown
   ![Description of image](path/to/screenshot.png)
   ```

2. Ensure all images are appropriately sized (recommend maximum width of 800px)

3. Add captions where needed:
   ```markdown
   ![Description of image](path/to/screenshot.png)
   *Figure X: Caption explaining what is shown in the image*
   ```

4. When converting the markdown to PDF, ensure images are properly embedded and rendered

5. For annotations, use image editing software to add numbered callouts or arrows to highlight important UI elements