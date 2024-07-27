# OrderFlow

OrderFlow is a customer order management application designed to streamline the ordering process in a restaurant. This application allows cashiers, waiters, and chefs to manage orders efficiently with user-friendly interfaces and functionalities.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features
- User authentication for different roles (Cashier, Waiter, Chef)
- Intuitive UI for managing orders
- Popup windows for order details and item selection
- Dine-in and takeout options
- Message section for additional order instructions

## Technologies Used
- HTML
- CSS
- JavaScript

## Installation
1. Clone the repository:
    ```bash
    https://github.com/projectdr-birgunj/order_Management.git
    ```

2. Navigate to the project directory:
    ```bash
    cd order_Management
    ```

3. Open the `index.html` file in your browser to start the application.

## Usage
1. **Login Page**: Enter the login ID and password for the respective roles:
   - Cashier: 
     - ID: `cashAdmin`
     - Password: `cash100`
   - Waiter:
     - ID: `waiterAdmin`
     - Password: `waiter99`
   - Chef:
     - ID: `chefAdmin`
     - Password: `chef98`

2. **Navigation**:
   - Use the navigation bar to access different pages.
   - Click on the logo to return to the home page (if logged out).

3. **Order Management**:
   - Waiters can click on table numbers to open a popup window with menu items.
   - Add items to the cart and select dine-in or takeout options.
   - Confirm the order and add any additional instructions in the message section.

4. **Logout**:
   - Use the logout button to return to the home page.

## Contributing

We welcome contributions to OrderFlow! To contribute:

1. Fork the repository only once.

2. Download the original repository to your local machine every time before pushing any changes:
   ```bash
   git remote add upstream https://github.com/projectdr-birgunj/order_Management.git
   git fetch upstream
   git checkout main
   git merge upstream/main
   git push origin main
   ```

3. After downloading, you can make changes:
   - Edit any code or create new pages or functions.

4. Once your work for the day is complete and you want to send it for merging:
   ```bash
   git add README.md
   git commit -m "Updated README.md file "
   git pull
   git push origin main
   ```

5. Open a pull request:
   - Open your forked GitHub repository and create a pull request from the 'Contribute' section.
   - If you do not see any branch conflict message, then you have done everything correctly.

Good luck!

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.