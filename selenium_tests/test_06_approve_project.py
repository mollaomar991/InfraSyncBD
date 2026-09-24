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

# Navigate to Approvals Page
driver.get("http://localhost:5173/approvals")
time.sleep(2)

# Click on an Approve button
try:
    approve_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Approve')]")
    if approve_buttons:
        driver.execute_script("arguments[0].scrollIntoView(true);", approve_buttons[0])
        time.sleep(1)
        driver.execute_script("arguments[0].click();", approve_buttons[0])
        time.sleep(2)
        print("Test 6: Clicked Approve button successfully.")
    else:
        print("Test 6: No projects pending approval found.")
except Exception as e:
    print("Test 6: Failed to approve project:", e)
