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

# Navigate to Contractors / Assignment Page
driver.get("http://localhost:5173/contractors")
time.sleep(2)

# Look for Assign Button
try:
    selects = driver.find_elements(By.TAG_NAME, "select")
    project_options = selects[0].find_elements(By.TAG_NAME, "option")
    if len(project_options) > 1:
        project_options[1].click()
        time.sleep(1)
        
        contractor_options = selects[1].find_elements(By.TAG_NAME, "option")
        contractor_options[1].click()
        time.sleep(1)
        
        confirm_btn = driver.find_element(By.XPATH, "//button[contains(., 'Confirm Assignment')]")
        driver.execute_script("arguments[0].scrollIntoView(true);", confirm_btn)
        time.sleep(1)
        driver.execute_script("arguments[0].click();", confirm_btn)
        time.sleep(2)
        print("Test 7: Contractor assigned successfully.")
    else:
        print("Test 7: No approved projects available to assign.")
except Exception as e:
    print("Test 7: Failed to assign contractor:", e)
