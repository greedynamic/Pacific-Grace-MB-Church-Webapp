import pytest
import time
from selenium import webdriver
import sys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from time import sleep

def test_church_app():
    # driver = webdriver.Chrome('/usr/bin/chromedriver')  # Optional argument, if not specified will search path.
    # driver.get('http://www.google.com/');
    chromeOptions = webdriver.ChromeOptions() 
    chromeOptions.add_experimental_option("prefs", {"profile.managed_default_content_settings.images": 2}) 
    chromeOptions.add_argument("--no-sandbox") 
    chromeOptions.add_argument("--disable-setuid-sandbox") 

    chromeOptions.add_argument("--remote-debugging-port=9222")  # this

    chromeOptions.add_argument("--disable-dev-shm-using") 
    chromeOptions.add_argument("--disable-extensions") 
    chromeOptions.add_argument("--disable-gpu") 
    chromeOptions.add_argument("start-maximized") 
    chromeOptions.add_argument("disable-infobars")
    # chromeOptions.add_argument(r"user-data-dir=.\cookies\\test") 

    driver = webdriver.Chrome(options=chromeOptions) 
    driver.get("http://localhost:5000/") 
    time.sleep(2) 

    # test login button will direct to login page
    loginButton = driver.find_element_by_class_name('loginBtn')
    loginButton.click()
    title = "Login"
    assert title == driver.title

    # test signup button will direct to signup page
    driver.get("http://localhost:5000/") 
    signUpButton = driver.find_element_by_class_name('signUpBtn')
    signUpButton.click()
    title = "Register an Account"
    assert title == driver.title

    # test video button will direct to video page
    driver.get("http://localhost:5000/") 
    videoButton = driver.find_element_by_class_name('video_heading')
    videoButton.click()
    moreVideoBtn = driver.find_element_by_class_name('more-videos')
    moreVideoBtn.click()
    title = "Archived Videos"
    assert title == driver.title
    # test meeting button will direct to signup page
    driver.quit()
    # driver = webdriver.Chrome()
    # driver.get('https://church276.herokuapp.com/')
    # driver.maximize_window()
    # driver.find_element_by_name("li").click()
    # # driver.find_element_by_name("li2").click()
    # title = "Login"
    # assert title == driver.title
    # sample_text = "Functional test"
    # email_text_field = driver.find_element_by_id("sampletodotext")
    # email_text_field.send_keys(sample_text)
    # sleep(5)
    # driver.find_element_by_id("addbutton").click()
    # sleep(5)
    # output_str = driver.find_element_by_name("li6").text
    # sys.stderr.write(output_str)
    # sleep(2)
    # driver.quit()

test_church_app()


# import unittest
# from selenium import webdriver
# from selenium.webdriver.common.keys import Keys

# class PythonOrgSearch(unittest.TestCase):

#     def setUp(self):
#         self.driver = webdriver.Firefox()

#     def test_search_in_python_org(self):
#         driver = self.driver
#         driver.get("http://www.python.org")
#         self.assertIn("Python", driver.title)
#         elem = driver.find_element_by_name("q")
#         elem.send_keys("pycon")
#         elem.send_keys(Keys.RETURN)
#         self.assertNotIn("No results found.", driver.page_source)


#     def tearDown(self):
#         self.driver.close()

# if __name__ == "__main__":
#     unittest.main()