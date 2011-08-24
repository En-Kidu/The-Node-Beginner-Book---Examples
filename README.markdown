# Node Beginner Examples

Examples I have completed as i read The Node Beginner Book - http://www.nodebeginner.org

The following is taken directly from The Node Beginner Book to explain the files within this repository.

## The use cases

Let's keep it simple, but realistic:

* The user should be able to use our application with a web browser
* The user should see a welcome page when requesting http://domain/start which displays a file upload form
* By choosing an image file to upload and submitting the form, this image should then be uploaded to http://domain/upload, where it is displayed once the upload is finished

Fair enough. Now, you could achieve this goal by googling and hacking together something. But that's not what we want to do here.

Furthermore, we don't want to write only the most basic code to achieve the goal, however elegant and correct this code might be. We will intentionally add more abstraction than necessary in order to get a feeling for building more complex Node.js applications.

## The Application Stack

Let's dissect our application. Which parts need to be implemented in order to fulfill the use cases?

* We want to serve web pages, therefore we need an **HTTP server**
* Our server will need to answer differently to requests, depending on which URL the request was asking for, thus we need some kind of **router** in order to map requests to request handlers
* To fullfill the requests that arrived at the server and have been routed using the router, we need actual **request handlers**
* The router probably should also treat any incoming POST data and give it to the request handlers in a convenient form, thus we need **request data handling**
* We not only want to handle requests for URLs, we also want to display content when these URLs are requested, which means we need some kind of **view logic** the request handlers can use in order to send content to the user's browser
* Last but not least, the user will be able to upload images, so we are going to need some kind of **upload handling** which takes care of the	details

Let's think a moment about how we would build this stack with PHP. It's not exactly a secret that the typical setup would be an Apache HTTP server with mod_php5 installed. 
Which in turn means that the whole "we need to be able to serve web pages and receive HTTP requests" stuff doesn't happen within PHP itself.

Well, with node, things are a bit different. Because with Node.js, we not only implement our application, we also implement the whole HTTP server. In fact, our web application	and its web server are basically the same.

This might sound like a lot of work, but we will see in a moment that with Node.js, it's not.

Let's just start at the beginning and implement the first part of our stack, the HTTP server.
