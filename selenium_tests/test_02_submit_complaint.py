import time
from selenium import webdriver
from selenium.webdriver.edge.service import Service
from selenium.webdriver.common.by import By

# To Keep Browser Open Indefinitely
options = webdriver.EdgeOptions()
options.add_experimental_option("detach", True)

service_obj = Service()
driver = webdriver.Edge(options=options, service=service_obj)
driver.maximize_window()

# Step 1: Login
driver.get("http://localhost:5173/login")
time.sleep(3)
driver.find_element(By.XPATH, "//input[@type='email']").send_keys("rahim@citizen.com")
driver.find_element(By.XPATH, "//input[@type='password']").send_keys("admin123")
driver.find_element(By.XPATH, "//button[@type='submit']").click()
time.sleep(5)

# Step 2: Navigate to Submit Complaint Page
driver.get("http://localhost:5173/complaints/new")
time.sleep(5)

print("Current URL before filling form:", driver.current_url)

# Step 3: Fill out the form
selects = driver.find_elements(By.TAG_NAME, "select")
if not selects:
    print("Error: Could not find any select elements on this page!")
else:
    # 1. Project Dropdown (1st select)
    selects[0].send_keys("Mirpur")
    # 2. Category Dropdown (2nd select)
    selects[1].send_keys("Road Damage")

# 3. Location 
driver.find_element(By.XPATH, "//input[@placeholder='Road, landmark, or area']").send_keys("Mirpur 10, Main Road")
# 4. Description
driver.find_element(By.XPATH, "//textarea").send_keys("Large pothole causing traffic issues.")

# Step 4: Submit
submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
driver.execute_script("arguments[0].scrollIntoView(true);", submit_btn)
time.sleep(1)
driver.execute_script("arguments[0].click();", submit_btn)
time.sleep(3)

# Confirmation
current_url = driver.current_url
print("Current URL:", current_url)

if "new" not in current_url.lower():
    print("Test 2: Complaint submitted successfully!")
else:
    print("Test 2: Failed to submit complaint.")

assert "new" not in current_url.lower()
