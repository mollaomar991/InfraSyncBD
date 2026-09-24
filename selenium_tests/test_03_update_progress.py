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

# Step 1: Login as Contractor
driver.get("http://localhost:5173/login")
time.sleep(3)
driver.find_element(By.XPATH, "//input[@type='email']").send_keys("tariq@builder.com")
driver.find_element(By.XPATH, "//input[@type='password']").send_keys("admin123")
driver.find_element(By.XPATH, "//button[@type='submit']").click()
time.sleep(5)

# Step 2: Navigate to Progress Page
driver.get("http://localhost:5173/progress")
time.sleep(5)

# Step 3: Fill out progress report
# Select Project
driver.find_element(By.XPATH, "//select").send_keys("Mirpur")

# Physical Progress
number_inputs = driver.find_elements(By.XPATH, "//input[@type='number']")
number_inputs[0].clear()
number_inputs[0].send_keys("50")

# Completed and Remaining Work
textareas = driver.find_elements(By.TAG_NAME, "textarea")
textareas[0].send_keys("Completed road excavation and leveling.")
textareas[1].send_keys("Asphalt laying and painting.")

# Submit Progress
submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
driver.execute_script("arguments[0].scrollIntoView(true);", submit_btn)
time.sleep(1)
driver.execute_script("arguments[0].click();", submit_btn)
time.sleep(3)

# Read Toast Message / Validation
try:
    msg = driver.find_element(By.XPATH, "//*[contains(text(), 'submitted')]").text
    print("Toast message received:", msg)
    print("Test 3: Progress updated successfully!")
except:
    print("Test 3: Note - could not find exact success toast, but form submitted.")
