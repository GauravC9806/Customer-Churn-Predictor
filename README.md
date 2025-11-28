**Telecom Customer Churn Prediction System**

The Telecom Customer Churn Prediction System is a machine learning-based web application designed to predict whether a customer is likely to discontinue telecom services. The project analyzes customer behavior, account details, service usage, and billing patterns to estimate churn probability.

This project demonstrates how data science techniques and a simple web interface can be used together to solve real-world problems related to customer retention.


**1. Objective**

The main goal of this project is to identify customers who are at high risk of churning. By predicting churn early, telecom companies can implement retention strategies and reduce revenue loss. The system provides an interactive interface where users can input customer details and obtain real-time churn predictions.


**2. Machine Learning Overview**

The project involves the following steps:

* Data Preprocessing:

  * Handling missing values
  * Encoding categorical features
  * Scaling numerical features
  * Removing duplicates and inconsistencies

* Exploratory Data Analysis:

  * Understanding usage patterns
  * Analyzing contract types and billing distribution
  * Discovering the most influential churn-related factors

* Model Training:

  * Logistic Regression
  * Random Forest
  * Gradient Boosting (XGBoost)
  * Support Vector Machine
    The best-performing model is saved and used for predictions.

* Evaluation Metrics:

  * Accuracy
  * Precision and Recall
  * F1-Score
  * Confusion Matrix
  * ROC–AUC Score


**3. Key Churn Indicators**

Based on analysis and feature importance scores, the major factors affecting customer churn include:

* Tenure (shorter tenure increases churn likelihood)
* Monthly charges (higher charges correlate with higher churn rates)
* Contract type (month-to-month contracts show highest churn)
* Internet and support services used
* Payment methods

These insights can help organizations understand customer behavior and plan retention strategies.



**4. System Features**

* User-friendly interface to input customer details
* Real-time churn prediction output
* Lightweight and fast
* Works on any modern browser
* Easy to deploy and extend



**5. Technology Stack**

Machine Learning:

* Python
* Pandas
* NumPy
* Scikit-learn
* XGBoost (optional)
* Joblib for saving the model

Web Application:

* HTML, CSS, JavaScript
* REST API for prediction requests
* Backend service for loading the trained model


**6. Project Structure**

telecom-churn-prediction/

* model/              (trained machine learning model files)
* api/                (backend prediction service)
* app/                (frontend interface files)
* data/               (dataset used for training)
* notebooks/          (EDA and model training notebooks)
* requirements.txt    (Python dependencies)
* README.txt          (project documentation)



**7. How to Run Locally**

This can be run currently on this link given here : https://crdkjlr4-5173.inc1.devtunnels.ms/

**8. Deployment**

The system can be deployed on any preferred hosting service:

Backend:

* Render
* Railway
* Heroku
* AWS, GCP, or Azure

Frontend:

* Netlify
* Vercel
* GitHub Pages

The frontend connects to the backend prediction API for churn inference.

**9. Future Improvements**

* Add visual dashboards and charts
* Include SHAP-based explanation for predictions
* Add user authentication
* Deploy the model as a containerized microservice
* Automate retraining with fresh data
* Improve UI styling

