import time
from selenium import webdriver
from selenium.webdriver.edge.service import Service
from selenium.webdriver.common.by import By

options = webdriver.EdgeOptions()
options.add_experimental_option("detach", True)

service_obj = Service()
driver = webdriver.Edge(options=options, service=service_obj)
driver.maximize_window()

# Login as Admin
driver.get("http://localhost:5173/login")
time.sleep(2)
driver.find_element(By.XPATH, "//input[@type='email']").send_keys("admin@infrasync.gov.bd")
driver.find_element(By.XPATH, "//input[@type='password']").send_keys("admin123")
driver.find_element(By.XPATH, "//button[@type='submit']").click()
time.sleep(3)

# Navigate to Complaints Page
driver.get("http://localhost:5173/complaints")
time.sleep(2)

# Look for 'Send reminder' button
try:
    reminder_btns = driver.find_elements(By.XPATH, "//button[contains(text(), 'Send reminder')]")
    if reminder_btns:
        reminder_btns[0].click()
        print("Test 9: Complaint notification sent successfully.")
    else:
        print("Test 9: No complaint reminders available.")
except:
    print("Test 9: Failed to send complaint notification.")
