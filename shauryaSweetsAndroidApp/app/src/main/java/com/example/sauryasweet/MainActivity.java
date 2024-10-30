package com.example.sauryasweet;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {
    private boolean isInitialLoad = true; // Track if it's the initial page load
    private SwipeRefreshLayout swipeRefreshLayout;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        WebView webView = findViewById(R.id.webView);
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout);

//        webView.setWebViewClient(new WebViewClient()); // Ensures opening in the WebView

        // Set WebViewClient with login check on page finish loading
        webView.setWebViewClient(new WebViewClient() );

        // Enable JavaScript
        WebSettings webSettings = webView.getSettings();
        webSettings.setDomStorageEnabled(true);
        webSettings.setJavaScriptEnabled(true);
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false); // Allows autoplay of media

        // Load your website
        webView.loadUrl("https://sauryasweets.netlify.app/frontend/src/index.html");

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
