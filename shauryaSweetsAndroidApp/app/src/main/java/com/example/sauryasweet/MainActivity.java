package com.example.sauryasweet;

import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.ValueCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import android.util.Log;
import org.json.JSONException;
import org.json.JSONObject;
import androidx.annotation.NonNull;
import android.Manifest;
import android.widget.Toast;

import com.google.android.gms.tasks.Continuation;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.functions.FirebaseFunctions;
import com.google.firebase.functions.HttpsCallableResult;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.functions.FirebaseFunctionsException;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;


public class MainActivity extends AppCompatActivity {
    //private boolean isInitialLoad = true; // Track if it's the initial page load
    private static final int REQUEST_NOTIFICATION_PERMISSION = 1001;
    private static final String TAG = "MainActivity";
    private SwipeRefreshLayout swipeRefreshLayout;
    String targetWebPage = "index.html";
    String baseUrl = "https://sauryasweets.netlify.app/frontend/src/";
//    String userUid;

    public class MyJavaScriptInterface {

        @JavascriptInterface
        public void onUserSignedIn(String uid) {
            // Trigger FCM token retrieval when user signs in
            Log.d("AndroidInterface", "User logged out, clear any stored FCM token if necessary");
            initializeFCM(uid);
        }

        @JavascriptInterface
        public void onUserLoggedOut() {
            // Optionally handle logout; e.g., clear stored FCM token if needed
            Log.d("AndroidInterface", "User logged out, clear any stored FCM token if necessary");
        }

        @JavascriptInterface
        public void triggerCloudFunction(String userID) {
            Log.d("AndroidInterface", "Received userID: " + userID);

            // Prepare data to send to Cloud Function
            Map<String, Object> data = new HashMap<>();
            data.put("userID", userID);

            // Trigger Firebase Cloud Function
            FirebaseFunctions.getInstance()
                    .getHttpsCallable("deleteUserByUID")
                    .call(data)
                    .addOnSuccessListener(result -> {
                        // Handle successful execution
                        Log.d("AndroidInterface", "Cloud Function executed successfully.");
                    })
                    .addOnFailureListener(e -> {
                        // Handle errors
                        Log.e("AndroidInterface", "Error executing Cloud Function: ", e);
                    });
        }
    }

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
                                Log.d("WebViewData", "Data from localStorage: " + value);

                                try {
                                    JSONObject jsonObject = new JSONObject(value);
                                    String isLoggedIn = jsonObject.getString("isLoggedIn");
                                    String userRole = jsonObject.getString("userRole");

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
        webView.addJavascriptInterface(new MyJavaScriptInterface(), "AndroidInterface");
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false); // Allows autoplay of media

//        // Update targetWebPage by concatenating the base URL with the specific page
        Log.d("UserRole", "targetWebPage value is: "+targetWebPage);
//        targetWebPage = baseUrl + targetWebPage;
//
//        Log.d("UserRole", "targetWebPage value is: "+targetWebPage);
        // Load your website
        webView.loadUrl(baseUrl + targetWebPage);

//        webView.addJavascriptInterface(new Object() {
//            @JavascriptInterface
//
//        }, "AndroidInterfaceDeleteUser");



        // Request notification permission if Android 13 or above
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requestNotificationPermission();
        } else {
            // For earlier versions, directly initialize FCM
            Toast.makeText(this, "Notification permission not granted", Toast.LENGTH_SHORT).show();
        }

        // Set up the SwipeRefreshLayout
        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                webView.reload(); // Refresh the WebView
                swipeRefreshLayout.setRefreshing(false); // Stop the refreshing animation
            }
        });

        webView.setOnScrollChangeListener((v, scrollX, scrollY, oldScrollX, oldScrollY) -> {
            if (scrollY == 0) {
                // Enable swipe refresh when WebView is scrolled to the top
                swipeRefreshLayout.setEnabled(true);
            } else {
                // Disable swipe refresh when WebView is not at the top
                swipeRefreshLayout.setEnabled(false);
            }
        });
    }

    private void requestNotificationPermission() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQUEST_NOTIFICATION_PERMISSION);
        } else {
            // Permission already granted
//            Toast.makeText(this, "Notification permission already granted", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        if (requestCode == REQUEST_NOTIFICATION_PERMISSION) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permission granted
//                Toast.makeText(this, "Notification permission already granted", Toast.LENGTH_SHORT).show();
            } else {
                // Permission denied
                Toast.makeText(this, "Notification permission not granted", Toast.LENGTH_SHORT).show();
                Log.e(TAG, "Notification permission denied.");
            }
        }
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
    }

    private void initializeFCM(String uid) {
//        Log.e("token","initializeFCM is called");
        FirebaseMessaging.getInstance().getToken()
                .addOnCompleteListener(task -> {
                    if (!task.isSuccessful()) {
                        Log.w("token", "Fetching FCM registration token failed", task.getException());
                        return;
                    }
                    String token = task.getResult();
//                    Log.d(TAG, "FCM Token: " + token);
                    callFCMSaveToken(token, uid)
                            .addOnCompleteListener(new OnCompleteListener<String>() {
                                @Override
                                public void onComplete(@NonNull Task<String> task) {
                                    if (!task.isSuccessful()) {
                                        Exception e = task.getException();
                                        if (e instanceof FirebaseFunctionsException) {
                                            FirebaseFunctionsException ffe = (FirebaseFunctionsException) e;
                                            FirebaseFunctionsException.Code code = ffe.getCode();
                                            Object details = ffe.getDetails();
                                        }
                                    }
                                }
                            });
                });
    }

    private Task<String> callFCMSaveToken(String token, String userUid) {
        // Create the arguments to the callable function.
        Log.e("token", "callFCMSaveToken Enter with token = " + token);
        Log.e("token", "callFCMSaveToken checking uid = " + userUid);
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("uid", userUid);

        FirebaseFunctions mFunctions = FirebaseFunctions.getInstance();
        return mFunctions
                .getHttpsCallable("saveToken")
                .call(data)
                .continueWith(new Continuation<HttpsCallableResult, String>() {
                    @Override
                    public String then(@NonNull Task<HttpsCallableResult> task) throws Exception {
                        // This continuation runs on either success or failure, but if the task
                        // has failed then getResult() will throw an Exception which will be
                        // propagated down.
                        String result = (String) task.getResult().getData();
                        return result;
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
