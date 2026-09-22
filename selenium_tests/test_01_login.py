import time
from selenium import webdriver
from selenium.webdriver.edge.service import Service
from selenium.webdriver.common.by import By

# To Keep Browser Open Indefinitely
options = webdriver.EdgeOptions()
options.add_experimental_option("detach", True)

# Edge Driver
service_obj = Service()
driver = webdriver.Edge(options=options, service=service_obj)

# Browser Tasks
driver.maximize_window()
driver.get("http://localhost:5173/login")

time.sleep(2) # Wait for page load

# Find Elements and Send Data
driver.find_element(By.XPATH, "//input[@type='email']").send_keys("salman@rhd.gov.bd")
driver.find_element(By.XPATH, "//input[@type='password']").send_keys("admin123")

# Click Login Button
driver.find_element(By.XPATH, "//button[@type='submit']").click()

time.sleep(3) # Wait for login process

# Confirmation
current_url = driver.current_url
print("Current URL:", current_url)

if "login" not in current_url.lower():
    print("Test 1: Login functionality working perfectly!")
else:
    print("Test 1: Login failed.")

assert "login" not in current_url.lower()
