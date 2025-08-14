# APP Design Project

## Project Description and Requirements

### Project Description

A unified communication platform designed to integrate all major messaging services into one single interface, maximising efficiency.  

### Project Requirements

| Functional                            | Non-Functional                   |
| --------------------------------------| ---------------------------------|
| Merge social media apps together      | Load messages sent under 1 second|
| Allow communication between people    | Easy to navigate                 |
| User account management               | Compatibility                    |

## Website Designs

### Inside the Page

<img src="website-design-1.png" alt="website design 1">

### Sign in Page

<img src="website-design-2.png" alt="website design 2">

### Log in Page

<img src="website-design-3.png" alt="website design 3">

## Alternative Designs

### Inside the Page

<img src="alternative design 1.png">

### Sign in Page

<img src="alternative design 2.png">

### Log in Page

<img src="alternative design 3.png">

## Algorithms

### Functional Requirement

Sending Messages

<img src="message_send_algorithm.png">

### Test Case 1

Test Case ID: TC001

Test Case Name: Successful Message Sent

Preconditions: User is signed in, external platform is connected and permissions granted, internet connection active

Test Steps:

    1. User selects Discord
    2. User types "hello"
    3. Checks if user is signed in and permission granted from Discord
    4. Mark as "Sending" in chat
    5. Delivers message to Discord
    6. Message status changes to "Sent"

Expected Result: Message delivered and received successfully, message status shows as "Sent"

Priority: High

### Test Case 2

Test Case ID: TC002

Test Case Name: Unsuccessful Message Sent

Preconditions: User is signed in, external platform is connected and permissions not granted, internet connection active

Test Steps:

    1. User selects Discord
    2. User types "hello"
    3. Checks if user is signed in and permission granted from Discord
    4. Show error message due to permissions being not granted

Expected Result: Error message is displayed: "You do not have permission to send through this platform." Message is not sent or shown in chat.

Priority: High



