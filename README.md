# Pacific-Grace-MB-Church-Webapp
This webapp is created for Port Moody Pacific Grace MB Church

## Issues Addressed By This Project

The customer currently has a dated website that they use for their church, Port Moody Pacific Grace MB Church.

They stated various problems regarding the ineffective website design. The website lacks a modern design, usability, and good content and element distribution. The website has a generic old-fashioned design that displays little visual appeal. Moreover, they have long lists to hold data. For example, to view the audio recordings, they have a long list that impairs visual clarity and navigation. Furthermore, looking specifically at the home page, it presents a messy layout cluttered with elements such as hyperlinks, text, events posts, and a Facebook API. Contrarily, looking at the church files and claims form pages, they only show a few text and hyperlinks. 

These problems encouraged the customer to request an update on the entire website. They requested a completely new and modern design with improved usability including visual clarity and navigation, and advanced features.
 
Our project will present an advanced modern website design utilizing state-of-the-art UI/UX designs, Web3.0 features, and APIs. We will be integrating APIs with Zoom, Youtube, Google Calendar, Maps, and Sheets, as well as Paypal.


## Scope of the project:

One of the main features provided by the application is creating and posting a WordPress-style blog post on the church’s page. Blog creation will be developed with the support of the node.js package (body-parse, theme) and REST API (post request) to save blog content on the database. This feature is only available to admin users (church owners) who want to post new church events information. The app does this by storing users' information in a database via the login/register feature and using this data to determine available features to different types of users. We will focus on developing login/register and blog post features in the first iteration. 

The second iteration develops uploading videos and prayer meeting room booking features. The application allows admin users to upload locally stored videos and modify viewability (public/private/archived) to either registered or unregistered users. The Youtube API is used to display uploaded videos. On the other hand, the prayer room booking feature is available to both admin and registered users. The web page allows registered users to fill out an online form (users’ information and date) to book space for baptism/praying in the church or online meetings using the Zoom API. 

The third iteration supports the development of language toggles and monthly donation/online shopping features. The application stores English and Chinese data on a database to toggle between these two languages according to the user's request. This feature is available to all types of users of the application. Moreover, the web page also allows verified users to send monthly or one-time donations using PayPal API, and these transactions can be stored in a database or google sheet. Aside from the users’ private information on the PayPal website (credit card), admins can access the transaction database (date, amount). Our webpage also provides some available products for the users to buy from the church and the transaction can be also done online using the PayPal API.

## Features and stories of the project:
 
This project will mainly have seven big features. The first epic is letting the user register and log in. The second epic is letting the user have different user security clearances and post blogs or church news. The third epic is letting the user upload and manage videos. The fourth epic is letting the user book an online room or physical room in the church for their meetings. The fifth epic is letting the user donate and shop online. Finally, the sixth epic is letting the user view the webpage in both English and Chinese. 

Users will be separated into three types: guest, registered, and admin. Guests are unregistered users that only have basic actions. They can visit the website in both English and Chinese, register an account, and view blogs and videos. Registered users can do everything a guest can as well as comment in the church’s blog, upload videos, donate and purchase from the online store, and book a room for events and meetings. Admins are registered users with admin privileges. They have access to managing the website. This includes editing, posting, updating, and deleting a blog post, archiving videos, and managing all products in the online store.

Typical sample story / scenario one:
	The user visits the site and views the church's main webpage as an unregistered user. Then the user signs up using a valid email. After the registration, the user’s email inbox receives a validation email and the user clicks the verify link that redirects the user to the church main webpage as a registered user.

Typical sample story / scenario two:
The user visits the site as an admin and posts a blog or recent news related to the church. The church’s Twitter account will simultaneously post a new tweet with the title of the blog and the link that directs to the blog URL.	

Typical sample story / scenario three:
	The user sees a new tweet with the blog URL and clicks the URL and views the blog. The user adds a comment at the bottom of the blog page and submits the comment. The latest comment appears at the top of the comment block.

Typical sample story / scenario four:
	The user decides to watch a previous service and opens the website. The user navigates to archived videos and is able to then watch archived videos. 

Typical sample story / scenario five:
The user feels generous and opens the website. The user clicks the donation button and it shows all the donation choices in a listview. The user decides to donate. If the user is not a registered user, the website asks to log in or create an account. After the donation, the website prompts a thankful message.	

Typical sample story / scenario six:
The user wants to purchase some church products, like books or brochures. The user opens the website and goes to the shop merchandise. The webpage shows all merchandise to the user and adds it to the cart. If the user is not a registered user, the website asks to log in or create an account. After the registration, the user is able to checkout and pay using Paypal. After the purchase, the user’s registered email receives a summary in the email and the website prompts a thankful message. 

## UI mockup:
![alt text](https://github.com/greedynamic/276_indivAssmnts/blob/main/MockupUI.jpeg)

## Workload enough for five people?

The workload for a total of 6 epics will be sufficient for five people to achieve. Each epic has many subproblems that cover-up work to complete in a two-week iteration for each member in the five-person group. 


