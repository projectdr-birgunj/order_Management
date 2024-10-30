package com.example.sauryasweet;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.ValueCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import android.util.Log;
import org.json.JSONException;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {
    //private boolean isInitialLoad = true; // Track if it's the initial page load
    private SwipeRefreshLayout swipeRefreshLayout;
    String targetWebPage = "index.html";
    String baseUrl = "https://sauryasweets.netlify.app/frontend/src/";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        WebView webView = findViewById(R.id.webView);
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout);

//        webView.setWebViewClient(new WebViewClient()); // Ensures opening in the WebView

        // Set WebViewClient with login check on page finish loading
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);

                // Retrieve values from localStorage
                view.evaluateJavascript(
                        "(function() { " +
                                "  return { " +
                                "    isLoggedIn: localStorage.getItem('isLoggedIn'), " +
                                "    userRole: localStorage.getItem('userRole') " +
                                "  }; " +
                                "})()", new ValueCallback<String>() {
                            @Override
                            public void onReceiveValue(String value) {
                                // Handle the returned JSON string (value)
                                // You might need to parse the JSON string to get individual values
                                Log.d("WebViewData", "Data from localStorage: " + value);
                                // Example of parsing if you use a JSON library
                                // JSONObject jsonObject = new JSONObject(value);
                                // Assume 'value' is the JSON string you received from localStorage
                                //String value = "{\"isLoggedIn\": \"true\", \"userRole\": \"waiter\"}"; // Example value for testing

                                try {
                                    // Parse the JSON string to get the values
                                    JSONObject jsonObject = new JSONObject(value);
                                    String isLoggedIn = jsonObject.getString("isLoggedIn");
                                    String userRole = jsonObject.getString("userRole");

                                    // Check if isLoggedIn and userRole are non-empty
                                    if (!isLoggedIn.isEmpty() && !userRole.isEmpty()) {
                                        // Handle the user role with a switch case
                                        switch (userRole) {
                                            case "waiter":
                                                // Code for when the user is a waiter
                                                targetWebPage = "waiter.html";
                                                Log.d("UserRole", "User is a Waiter");
                                                break;

                                            case "chef":
                                                // Code for when the user is a chef
                                                targetWebPage = "chef.html";
                                                Log.d("UserRole", "User is a Chef");
                                                break;

                                            case "cashier":
                                                // Code for when the user is a cashier
                                                targetWebPage = "cashier.html";
                                                Log.d("UserRole", "User is a Cashier");
                                                break;

                                            case "admin":
                                                // Code for when the user is an admin
                                                targetWebPage = "admin.html";
                                                Log.d("UserRole", "User is an Admin");
                                                break;

                                            default:
                                                // Code for unknown role
                                                targetWebPage = "index.html";
                                                Log.d("UserRole", "Unknown user role: " + userRole);
                                                break;
                                        }
                                    } else {
                                        Log.d("UserRole", "User is not logged in or role is empty");   }
                                        targetWebPage = baseUrl + targetWebPage;

                                        // Log the updated targetWebPage value
                                        Log.d("UserRole", "Final targetWebPage value is: " + targetWebPage);

                                        // Load the appropriate URL
                                    if (!url.equals(targetWebPage)) {
                                        // Load the appropriate URL
                                        webView.loadUrl(targetWebPage);
                                    }

                                } catch (JSONException e) {
                                    e.printStackTrace();
                                    Log.e("UserRole", "Error parsing JSON: " + e.getMessage());
                                }

                            }
                        });
            }
        });

        // Enable JavaScript
        WebSettings webSettings = webView.getSettings();
        webSettings.setDomStorageEnabled(true);
        webSettings.setJavaScriptEnabled(true);
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false); // Allows autoplay of media

//        // Update targetWebPage by concatenating the base URL with the specific page
        Log.d("UserRole", "targetWebPage value is: "+targetWebPage);
//        targetWebPage = baseUrl + targetWebPage;
//
//        Log.d("UserRole", "targetWebPage value is: "+targetWebPage);
        // Load your website
        webView.loadUrl(baseUrl + targetWebPage);

        // Set up the SwipeRefreshLayout
        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                webView.reload(); // Refresh the WebView
                swipeRefreshLayout.setRefreshing(false); // Stop the refreshing animation
            }
        });
    }

    @Override
    public void onBackPressed() {
        WebView webView = findViewById(R.id.webView);
        if (webView.canGoBack()) {
            webView.goBack(); // Go back in the web view history if possible
        } else {
            super.onBackPressed(); // Otherwise, exit the app
        }
    }
}
