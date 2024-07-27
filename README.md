# Expense Tracker

## Description

The **Expense Tracker** is a user-friendly application designed to help individuals manage their expenses efficiently. Built with Python using the Tkinter library for a graphical user interface, this application allows users to:

- **Add Expenses**: Record details of each expense including date, description, amount, currency, and category.
- **View Expenses**: Display a list of all recorded expenses in a tabular format.
- **Search Expenses**: Find specific expenses by description or category with an intuitive search bar.
- **Delete Expenses**: Remove individual or multiple selected expenses from the list.
- **Format Amounts**: Automatically format amounts with commas for better readability.
- **Export Data**: Export expense data to a CSV file for easy sharing and analysis.
- **Generate Reports**: Visualize expenses through pie charts, providing insights into spending patterns.
![Expense Tracker (lite view)](https://github.com/user-attachments/assets/e5f74512-9d5e-4d6d-880f-ce37cf4442cf)

## Features Include:

- Comprehensive data entry forms for detailed expense tracking.
- Multi-select functionality for bulk operations.
- Date picker for easier date selection.
- Integration with Pandas and Matplotlib for data management and visualization.
- Log file for tracking application activities and errors.

## Installation and Usage:

1. Clone the repository:
    ```bash
    git clone https://github.com/Bond0010/expense_tracker.git
    cd expense_tracker
    ```

2. Create and activate a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3. Install the required packages:
    ```bash
    pip install -r requirements.txt
    ```

4. Run the application:
    ```bash
    python expense_tracker.py
    ```

## Technologies Used:

- **Python**: Programming language used for development.
- **Tkinter**: GUI toolkit for creating the application interface.
- **SQLite**: Lightweight database for storing expense records.
- **Pandas**: Data manipulation library for exporting data to CSV.
- **Matplotlib**: Plotting library for generating expense reports.

## Requirements:

- tkcalendar==1.6.1
- pandas==2.0.3
- matplotlib==3.7.2

## License

This project is licensed under the MIT License. See the LICENSE file for details.
