# OrderFlow Manager — Cloth Shop

A GitHub Pages friendly static web app for cloth shop order management.

## Features

- Admin/staff login for local browser use
- New order entry with slip/receipt image and required expected delivery date
- Pending order list with expected delivery date
- Delivery confirmation
- Delivery is blocked unless the full remaining balance is collected
- Delivered archive with 30-day retention counter
- Activity log
- Search and filter
- CSV export
- EmailJS notification support
- EmailJS credentials are not hardcoded in source files
- Five preconfigured staff logins stored as hashes only

## Run Locally

Do not open `index.html` directly using `file:///`.

Use VS Code Live Server or run:

```bash
python -m http.server 5500
```

Then open:

```text
http://127.0.0.1:5500/index.html
```

## Default Local Login

Admin:

```text
Use your saved admin username and password.
```

Five staff logins are preconfigured as SHA-256 hashes only. Use the staff usernames and passwords you saved separately in your private note.

After admin login, go to **User Setup** to change admin credentials or add extra staff logins. The app will not display saved passwords.

## EmailJS Template Setup

Template variables:

```text
{{to_email}}
{{from_name}}
{{reply_to}}
{{staff_name}}
{{action}}
{{order_no}}
{{customer}}
{{total_price}}
{{paid_amount}}
{{baki_amount}}
{{expected_delivery_date}}
{{datetime}}
```

Template fields:

```text
To Email: {{to_email}}
From Name: {{from_name}}
Reply To: {{reply_to}}
```

Then save the following inside the app under **Email Alerts Setup**:

```text
Service ID
Template ID
Public Key
Admin Email
```

## Privacy and Security Notes

This project is safe for a GitHub demo because EmailJS IDs and app passwords are not hardcoded in the repository.

However, because this is a static frontend-only project:

- Local login is not server-level authentication.
- Data is stored in browser `localStorage`.
- Orders will not sync across multiple devices.
- Anyone with access to the same browser profile may access stored data.

For real production use, move authentication and database to Firebase or Supabase.


## Email Alerts Setup — Step by Step

1. Go to EmailJS and sign in.
2. Open **Email Services** and connect Gmail or another provider.
3. Copy the **Service ID**. It normally looks like `service_xxxxx`.
4. Open **Email Templates** and create a template.
5. In the template, set these fields exactly:

```text
To Email: {{to_email}}
From Name: {{from_name}}
Reply To: {{reply_to}}
Subject: New Order Alert - {{action}}
```

6. Use this body content:

```html
<h2>OrderFlow Notification</h2>
<p><strong>Staff:</strong> {{staff_name}}</p>
<p><strong>Action:</strong> {{action}}</p>
<p><strong>Order No:</strong> {{order_no}}</p>
<p><strong>Customer:</strong> {{customer}}</p>
<p><strong>Total Price:</strong> {{total_price}}</p>
<p><strong>Paid Amount:</strong> {{paid_amount}}</p>
<p><strong>Baki Amount:</strong> {{baki_amount}}</p>
<p><strong>Expected Delivery Date:</strong> {{expected_delivery_date}}</p>
<p><strong>Date & Time:</strong> {{datetime}}</p>
```

7. Save the template and copy the **Template ID**. It normally looks like `template_xxxxx`.
8. Go to **Account → General** and copy the **Public Key**.
9. In the OrderFlow app, log in as admin and open **Email Alerts Setup**.
10. Paste the Service ID, Template ID, Public Key, and Admin Email.
11. Click **Save Configuration**.
12. Click **Send Test Email**. If successful, check inbox/spam.

## Delivery Date Logic

- While creating a new order, staff must enter **Expected Delivery Date**.
- The app blocks past dates.
- Pending, Archive, Search, CSV export, activity log, and email alerts include the expected delivery date.
- Actual delivery date is still created automatically when the order is delivered.
- Delivery is blocked unless the full remaining balance is collected.

## Latest business rules

- Expected Delivery Date is required when placing an order.
- Expected Delivery Date must be **after** the Order Date. Same-day or past dates are blocked.
- Order payment must satisfy: `Amount Paid Now + Balance Due = Total Order Price`.
- Delivery is blocked unless the exact remaining balance is collected.
- After delivery, total paid becomes equal to total price and balance becomes `৳0.00`.
- The layout has responsive form/table behavior for desktop, tablet, and mobile screens.

## EmailJS setup reminder

1. Create/login to EmailJS.
2. Add Email Service and copy `Service ID`.
3. Create template and copy `Template ID`.
4. Go to Account → General and copy `Public Key`.
5. In the template, set:
   - To Email: `{{to_email}}`
   - From Name: `{{from_name}}`
   - Reply To: `{{reply_to}}`
6. Add variables in the content: `{{staff_name}}`, `{{action}}`, `{{order_no}}`, `{{customer}}`, `{{total_price}}`, `{{paid_amount}}`, `{{baki_amount}}`, `{{expected_delivery_date}}`, `{{datetime}}`.
7. In the app, go to **Email Alerts Setup**, paste the values, save, then send a test email.
