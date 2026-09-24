import time
from selenium import webdriver
from selenium.webdriver.edge.service import Service
from selenium.webdriver.common.by import By

options = webdriver.EdgeOptions()
options.add_experimental_option("detach", True)

service_obj = Service()
driver = webdriver.Edge(options=options, service=service_obj)
driver.maximize_window()

# Step 1: Go to Signup Page
driver.get("http://localhost:5173/signup")
time.sleep(2)

# Step 2: Choose Role (Citizen)
time.sleep(2)
driver.find_element(By.XPATH, "//strong[contains(text(), 'Citizen')]").click()
time.sleep(2)

# Step 3: Fill out registration form
driver.find_element(By.XPATH, "//input[@name='name']").send_keys("Test User")
driver.find_element(By.XPATH, "//input[@name='email']").send_keys("testuser123@demo.com")
driver.find_element(By.XPATH, "//input[@name='phone']").send_keys("01711000000")
driver.find_element(By.XPATH, "//input[@name='password']").send_keys("Password123")
driver.find_element(By.XPATH, "//input[@name='confirmPassword']").send_keys("Password123")

# Submit
submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
driver.execute_script("arguments[0].scrollIntoView(true);", submit_btn)
time.sleep(1)
driver.execute_script("arguments[0].click();", submit_btn)
time.sleep(3)

print("Test 4: Account Creation submitted.")
