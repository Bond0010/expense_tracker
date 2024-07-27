import tkinter as tk
from tkinter import ttk, messagebox
from tkcalendar import DateEntry
import sqlite3
import pandas as pd
import matplotlib.pyplot as plt
import logging

# Ensure the database schema is up-to-date
def update_database_schema():
    conn = sqlite3.connect('expenses.db')
    c = conn.cursor()
    # Add 'category' column if it does not exist
    try:
        c.execute('ALTER TABLE expenses ADD COLUMN category TEXT')
    except sqlite3.OperationalError:
        # The column already exists
        pass
    conn.commit()
    conn.close()

update_database_schema()

# Database setup
conn = sqlite3.connect('expenses.db')
c = conn.cursor()
c.execute('''
CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    description TEXT,
    amount REAL,
    currency TEXT,
    category TEXT
)
''')
conn.commit()

# Setup logging
logging.basicConfig(filename='expense_tracker.log', level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

class ExpenseTrackerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Expense Tracker")

        self.frame = ttk.Frame(root, padding="10")
        self.frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        self.create_widgets()
        self.load_expenses()

    def create_widgets(self):
        # Date
        ttk.Label(self.frame, text="Date:").grid(row=0, column=0, padx=5, pady=5, sticky=tk.W)
        self.date_entry = DateEntry(self.frame, width=12, background='darkblue', foreground='white', borderwidth=2)
        self.date_entry.grid(row=0, column=1, padx=5, pady=5, sticky=tk.E)

        # Description
        ttk.Label(self.frame, text="Description:").grid(row=1, column=0, padx=5, pady=5, sticky=tk.W)
        self.description_entry = ttk.Entry(self.frame)
        self.description_entry.grid(row=1, column=1, padx=5, pady=5, sticky=tk.E)

        # Amount
        ttk.Label(self.frame, text="Amount:").grid(row=2, column=0, padx=5, pady=5, sticky=tk.W)
        self.amount_entry = ttk.Entry(self.frame)
        self.amount_entry.grid(row=2, column=1, padx=5, pady=5, sticky=tk.E)
        self.amount_entry.bind("<FocusOut>", self.format_amount)

        # Currency
        ttk.Label(self.frame, text="Currency:").grid(row=3, column=0, padx=5, pady=5, sticky=tk.W)
        self.currency_entry = ttk.Combobox(self.frame, values=['USD', 'EUR', 'GBP', 'JPY'])
        self.currency_entry.grid(row=3, column=1, padx=5, pady=5, sticky=tk.E)

        # Category
        ttk.Label(self.frame, text="Category:").grid(row=4, column=0, padx=5, pady=5, sticky=tk.W)
        self.category_entry = ttk.Combobox(self.frame, values=['Food', 'Transportation', 'Entertainment', 'Healthcare'])
        self.category_entry.grid(row=4, column=1, padx=5, pady=5, sticky=tk.E)

        # Buttons
        ttk.Button(self.frame, text="Add Expense", command=self.add_expense).grid(row=5, column=1, padx=5, pady=5, sticky=tk.E)
        ttk.Button(self.frame, text="Delete Selected", command=self.delete_expenses).grid(row=6, column=0, columnspan=2, padx=5, pady=5)
        ttk.Button(self.frame, text="Export to CSV", command=self.export_to_csv).grid(row=7, column=0, columnspan=2, padx=5, pady=5)
        ttk.Button(self.frame, text="Generate Report", command=self.generate_report).grid(row=8, column=0, columnspan=2, padx=5, pady=5)

        # Search
        self.search_var = tk.StringVar()
        ttk.Label(self.frame, text="Search:").grid(row=9, column=0, padx=5, pady=5, sticky=tk.W)
        self.search_entry = ttk.Entry(self.frame, textvariable=self.search_var)
        self.search_entry.grid(row=9, column=1, padx=5, pady=5, sticky=tk.E)
        self.search_entry.bind('<KeyRelease>', self.search_expenses)

        # Treeview
        self.tree = ttk.Treeview(self.frame, columns=('ID', 'Date', 'Description', 'Amount', 'Currency', 'Category'), show='headings', selectmode='extended')
        self.tree.heading('ID', text='ID')
        self.tree.heading('Date', text='Date')
        self.tree.heading('Description', text='Description')
        self.tree.heading('Amount', text='Amount')
        self.tree.heading('Currency', text='Currency')
        self.tree.heading('Category', text='Category')
        self.tree.grid(row=10, column=0, columnspan=2, padx=5, pady=5)

    def format_amount(self, event=None):
        # Format amount with commas on focus out
        amount = self.amount_entry.get()
        if amount:
            amount = amount.replace(',', '')  # Remove existing commas
            try:
                float(amount)  # Validate if it's a valid number
                self.amount_entry.delete(0, tk.END)
                self.amount_entry.insert(0, '{:,.2f}'.format(float(amount)))
            except ValueError:
                # If it's not a valid number, clear the amount entry
                self.amount_entry.delete(0, tk.END)

    def add_expense(self):
        date = self.date_entry.get_date()
        description = self.description_entry.get()
        amount = self.amount_entry.get().replace(",", "")
        currency = self.currency_entry.get()
        category = self.category_entry.get()

        if date and description and amount and currency and category:
            try:
                amount = float(amount)  # Validate amount
                c.execute('INSERT INTO expenses (date, description, amount, currency, category) VALUES (?, ?, ?, ?, ?)', (date, description, amount, currency, category))
                conn.commit()
                logging.info(f'Added expense: {date}, {description}, {amount}, {currency}, {category}')
                self.load_expenses()
                self.date_entry.set_date('')
                self.description_entry.delete(0, tk.END)
                self.amount_entry.delete(0, tk.END)
                self.currency_entry.set('')
                self.category_entry.set('')
            except ValueError as e:
                logging.error(f'Error adding expense: {e}')

    def load_expenses(self):
        for i in self.tree.get_children():
            self.tree.delete(i)
        c.execute('SELECT * FROM expenses')
        for row in c.fetchall():
            self.tree.insert('', tk.END, values=row)

    def delete_expenses(self):
        selected_items = self.tree.selection()
        if selected_items:
            for selected_item in selected_items:
                item = self.tree.item(selected_item)
                expense_id = item['values'][0]
                c.execute('DELETE FROM expenses WHERE id=?', (expense_id,))
                conn.commit()
                logging.info(f'Deleted expense ID: {expense_id}')
            self.load_expenses()
        else:
            messagebox.showwarning("Selection Error", "Please select at least one expense to delete.")
            logging.warning('Attempted to delete without selection')

    def search_expenses(self, event=None):
        search_term = self.search_var.get().lower()
        for item in self.tree.get_children():
            self.tree.delete(item)
        c.execute('SELECT * FROM expenses WHERE description LIKE ? OR category LIKE ?', (f'%{search_term}%', f'%{search_term}%'))
        for row in c.fetchall():
            self.tree.insert('', tk.END, values=row)

    def export_to_csv(self):
        c.execute('SELECT * FROM expenses')
        data = c.fetchall()
        df = pd.DataFrame(data, columns=['ID', 'Date', 'Description', 'Amount', 'Currency', 'Category'])
        df.to_csv('expenses.csv', index=False)
        logging.info('Data exported to expenses.csv')
        messagebox.showinfo("Export", "Data exported to expenses.csv")

    def generate_report(self):
        c.execute('SELECT amount, currency FROM expenses')
        data = c.fetchall()
        df = pd.DataFrame(data, columns=['Amount', 'Currency'])
        summary = df.groupby('Currency').sum()
        summary.plot(kind='pie', y='Amount', autopct='%1.1f%%', legend=False)
        plt.title('Expenses by Currency')
        plt.show()
        logging.info('Generated expense report')

if __name__ == "__main__":
    root = tk.Tk()
    app = ExpenseTrackerApp(root)
    root.mainloop()
