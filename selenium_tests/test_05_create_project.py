import time
from selenium import webdriver
from selenium.webdriver.edge.service import Service
from selenium.webdriver.common.by import By

options = webdriver.EdgeOptions()
options.add_experimental_option("detach", True)

service_obj = Service()
driver = webdriver.Edge(options=options, service=service_obj)
driver.maximize_window()

# Login as Officer
driver.get("http://localhost:5173/login")
time.sleep(2)
driver.find_element(By.XPATH, "//input[@type='email']").send_keys("salman@rhd.gov.bd")
driver.find_element(By.XPATH, "//input[@type='password']").send_keys("admin123")
driver.find_element(By.XPATH, "//button[@type='submit']").click()
time.sleep(3)

# Navigate to Create Project
driver.get("http://localhost:5173/projects/new")
time.sleep(2)

# Fill out project form
driver.find_element(By.XPATH, "//input[@name='name']").send_keys("Test Highway Project")
driver.find_element(By.XPATH, "//input[@name='budget']").send_keys("50000000")
driver.find_element(By.XPATH, "//input[@name='startDate']").send_keys("01-01-2025")
driver.find_element(By.XPATH, "//input[@name='endDate']").send_keys("12-31-2025")
driver.find_element(By.XPATH, "//input[@name='road']").send_keys("Test Road")
driver.find_element(By.XPATH, "//input[@name='area']").send_keys("Test Area")
driver.find_element(By.XPATH, "//textarea[@name='description']").send_keys("Test Description")

# Click on map to add coordinate
time.sleep(1)
try:
    map_el = driver.find_element(By.CLASS_NAME, "leaflet-container")
    driver.execute_script("arguments[0].scrollIntoView(true);", map_el)
    time.sleep(1)
    driver.execute_script("arguments[0].click();", map_el)
    time.sleep(1)
except Exception as e:
    print("Could not click map:", e)

# Submit Project
submit_btn = driver.find_element(By.XPATH, "//button[@type='submit']")
driver.execute_script("arguments[0].scrollIntoView(true);", submit_btn)
time.sleep(1)
driver.execute_script("arguments[0].click();", submit_btn)
time.sleep(3)

print("Test 5: Create Project functionality tested.")
