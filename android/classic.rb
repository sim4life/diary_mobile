class Classic
  attr_reader :android_sdk_path, :name, :pkg, :www, :path

  def initialize(a)
    @android_sdk_path, @name, @pkg, @www, @path = a
    build
  end

  def build
    setup
    clobber
    build_jar
    create_android
    include_www
    generate_manifest
    copy_libs
    copy_props
    add_name_to_strings
    write_java
  end

  def setup
    @android_dir    = File.expand_path(File.dirname(__FILE__).gsub(/lib$/,''))
    @framework_dir  = File.join(@android_dir, "framework")
    @icon           = File.join(@www, 'icon.png') unless !@icon.nil? && File.exists?(@icon)
    # Hash that stores the location of icons for each resolution type. Uses the default icon for all resolutions as a baseline.
    @icons          = {
      :"drawable-ldpi" => @icon,
      :"drawable-mdpi" => @icon,
      :"drawable-hdpi" => @icon
    } if @icons.nil?
    @app_js_dir     = ''
    @content        = 'index.html'
  end

  # replaces @path with new android project
  def clobber
    FileUtils.rm_r(@path) if File.exists? @path
    FileUtils.mkdir_p @path
  end

  # removes local.properties and recreates based on android_sdk_path
  # then generates framework/phonegap.jar
  def build_jar
    %w(local.properties phonegap.js phonegap.jar).each do |f|
      FileUtils.rm File.join(@framework_dir, f) if File.exists? File.join(@framework_dir, f)
    end
    open(File.join(@framework_dir, "local.properties"), 'w') do |f|
      f.puts "sdk.dir=#{ @android_sdk_path }"
    end
    Dir.chdir(@framework_dir)
    `ant jar`
    Dir.chdir(@android_dir)
  end

  # runs android create project
  # TODO need to allow more flexible SDK targetting via config.xml
  def create_android
    IO.popen("android list targets") { |f|
      targets = f.readlines(nil)[0].scan(/id\:.*$/)
      target_id = nil
      if (targets.length > 0)
        # target_id = targets.last.match(/\d+/).to_a.first
        targets.each do |x|
          if x =~ /android\-8/
            if x =~ /id\:\s+(\d+)/
              target_id = $1
              break
            end
          end
        end
        target_id = targets.last.match(/\d+/).to_a.first if target_id.nil?
        `android create project -t #{ target_id } -k #{ @pkg } -a #{ @name.capitalize } -n #{ @name } -p #{ @path }`
      else
        puts "No Android targets found. Please run 'android' and install at least one SDK package."
        puts "If that makes no sense then you need to go read the Android SDK documentation."
      end
    }
  end

  # copies the project/www folder into tmp/android/www
  def include_www
    FileUtils.mkdir_p File.join(@path, "assets", "www")
    FileUtils.cp_r File.join(@www, "."), File.join(@path, "assets", "www")
  end

  # creates an AndroidManifest.xml for the project
  def generate_manifest
    manifest = ""
    open(File.join(@framework_dir, "AndroidManifest.xml"), 'r') do |old|
      manifest = old.read
      manifest.gsub! 'android:versionName="1.1"', 'android:versionName="1.0.1"'
      manifest.gsub! 'android:versionCode="5"', 'android:versionCode="2"'
      manifest.gsub! 'package="com.phonegap"', "package=\"#{ @pkg }\""
      manifest.gsub! 'android:name=".StandAlone"', "android:name=\".#{ @name.gsub(' ','').capitalize }\""
      manifest.gsub! 'android:minSdkVersion="2"', 'android:minSdkVersion="5"'
    end
    open(File.join(@path, "AndroidManifest.xml"), 'w') { |x| x.puts manifest }
  end
  
  def copy_libs
    version = IO.read(File.join(@framework_dir, '../VERSION')).lstrip.rstrip
    framework_res_dir = File.join(@framework_dir, "res")
    app_res_dir = File.join(@path, "res")
    # copies in the jar
    FileUtils.mkdir_p File.join(@path, "libs")
    FileUtils.cp File.join(@framework_dir, "phonegap.#{ version }.jar"), File.join(@path, "libs")
    FileUtils.cp File.join(@framework_dir, "FlurryAgent.jar"), File.join(@path, "libs")
    # copies in the strings.xml
    FileUtils.mkdir_p File.join(app_res_dir, "values")
    FileUtils.cp File.join(framework_res_dir, "values","strings.xml"), File.join(app_res_dir, "values", "strings.xml")
    # drops in the layout files: main.xml and preview.xml
    FileUtils.mkdir_p File.join(app_res_dir, "layout")
    %w(main.xml).each do |f|
      FileUtils.cp File.join(framework_res_dir, "layout", f), File.join(app_res_dir, "layout", f)
    end
    # icon file copy
    %w(drawable-hdpi drawable-ldpi drawable-mdpi).each do |e|
      # if specific resolution icons are specified, use those. if not, see if a general purpose icon was defined.
      # finally, fall back to using the default PhoneGap one.
      currentIcon = ""
      if !@icons[e.to_sym].nil? && File.exists?(File.join(@www, @icons[e.to_sym]))
        currentIcon = File.join(@www, @icons[e.to_sym])
      elsif File.exists?(@icon)
        currentIcon = @icon
      else
        currentIcon = File.join(framework_res_dir, "drawable", "icon.png")
      end
      FileUtils.mkdir_p(File.join(app_res_dir, e))
      FileUtils.cp(currentIcon, File.join(app_res_dir, e, "icon.png"))
    end
    # concat JS and put into www folder. this can be overridden in the config.xml via @app_js_dir
    js_dir = File.join(@framework_dir, "assets", "js")
    phonegapjs = IO.read(File.join(js_dir, 'phonegap.js.base'))
    Dir.new(js_dir).entries.each do |script|
      next if script[0].chr == "." or script == "phonegap.js.base"
      phonegapjs << IO.read(File.join(js_dir, script))
      phonegapjs << "\n\n"
    end
    File.open(File.join(@path, "assets", "www", @app_js_dir, "phonegap.#{ version }.js"), 'w') {|f| f.write(phonegapjs) }
  end

  # copies stuff from src directory into the android project directory (@path)
  def copy_props
    FileUtils.cp File.join(@framework_dir, "build.properties"), @path
  end

  # puts app name in strings
  def add_name_to_strings
    x = "<?xml version=\"1.0\" encoding=\"utf-8\"?>
    <resources>
      <string name=\"app_name\">#{ @name.capitalize } Mobile</string>
      <string name=\"go\">Snap</string>
    </resources>
    "
    open(File.join(@path, "res", "values", "strings.xml"), 'w') do |f|
      f.puts x.gsub('    ','')
    end
  end

  # create java source file
  def write_java
    j = "
    package #{ @pkg };

    import com.flurry.android.FlurryAgent;
    
    // import android.webkit.WebSettings;
    import android.app.Activity;
    import android.os.Bundle;
    import com.phonegap.*;

    public class #{ @name.gsub(' ','').capitalize } extends DroidGap
    {
        @Override
        public void onCreate(Bundle savedInstanceState)
        {
          super.onCreate(savedInstanceState);
          super.init();
          /*
          WebSettings settings = appView.getSettings(); 
          settings.setSupportZoom(false);
          */
          KeyBoard keyboard = new KeyBoard(this, appView);
          appView.addJavascriptInterface(keyboard, \"KeyBoard\");
          super.loadUrl(\"file:///android_asset/www/#{ @content }\");
          
        }
                
        @Override
        public void onStart()
        {
          //testing flurry key
          //FlurryAgent.onStartSession(this, \"EGZW51VANBPZEYV7AC55\");
          //production flurry key
          FlurryAgent.onStartSession(this, \"EN24M5L6KC9SDSW3CCI7\");
          appView.loadUrl(\"javascript:window.setTimeout(appActive, 1);\");
          super.onStart();
        }
                
        @Override
        public void onRestart() { 
            appView.loadUrl(\"javascript:window.setTimeout(appActive, 1);\");
            super.onRestart(); 
        }

        @Override
        public void onResume() { 
            appView.loadUrl(\"javascript:window.setTimeout(appActive, 1);\");
            super.onResume(); 
        }

        @Override
        public void onStop()
        {
          super.onStop();
          FlurryAgent.onEndSession(this);
        }
    }
    "
    code_dir = File.join(@path, "src", @pkg.gsub('.', File::SEPARATOR))
    FileUtils.mkdir_p(code_dir)
    open(File.join(code_dir, "#{ @name.capitalize }.java"),'w') { |f| f.puts j }
    
    j = "
    package #{ @pkg };
    
    import com.phonegap.DroidGap;
    import android.content.Context;
    import android.view.inputmethod.InputMethodManager;
    import android.webkit.WebView;

    public class KeyBoard {

      private WebView mAppView;
      private DroidGap mGap;

      public KeyBoard(DroidGap gap, WebView view)
      {
          mAppView = view;
          mGap = gap;
      }

      public void showKeyBoard() {
          InputMethodManager mgr = (InputMethodManager) mGap.getSystemService(Context.INPUT_METHOD_SERVICE);
          // only will trigger it if no physical keyboard is open
          mgr.showSoftInput(mAppView, InputMethodManager.SHOW_IMPLICIT);

          ((InputMethodManager) mGap.getSystemService(Context.INPUT_METHOD_SERVICE)).showSoftInput(mAppView, 0); 

      }

      public void hideKeyBoard() {
          InputMethodManager mgr = (InputMethodManager) mGap.getSystemService(Context.INPUT_METHOD_SERVICE);
          mgr.hideSoftInputFromWindow(mAppView.getWindowToken(), 0);
      }
    }
    "
    
    # code_dir = File.join(@path, "src", @pkg.gsub('.', File::SEPARATOR))
    # FileUtils.mkdir_p(code_dir)
    open(File.join(code_dir, "KeyBoard.java"),'w') { |f| f.puts j }
    
    j = "
    package #{ @pkg };
    
    import org.json.JSONArray;
    import org.json.JSONException;
    import org.json.JSONObject;
    import android.util.Log;

    import com.flurry.android.FlurryAgent;
    import com.phonegap.api.Plugin;
    import com.phonegap.api.PluginResult;
    import com.phonegap.api.PluginResult.Status;
    
    
    public class FlurryPlugin extends Plugin {

      public static final String CNT_ACTION=\"countPageView\";
      public static final String LOG_ACTION=\"logEvent\";
      public static final String SET_ACTION=\"setUserID\";

      @Override
      public PluginResult execute(String action, JSONArray data, String callbackId) {
        Log.d(\"Flurry Plugin\", \"Plugin Called with action::\"+action);
        PluginResult result = null;

        if (CNT_ACTION.equals(action)) {
          try {
            countPageView();
          } catch (Exception ex) {
            Log.d(\"Flurry Plugin\", \"Got Exception \"+ ex.getMessage());
            result = new PluginResult(Status.JSON_EXCEPTION);
          }
        }
        else if(LOG_ACTION.equals(action)) {
          try {
            String eventName = data.getString(0);
            logEvent(eventName);
            /*
            JSONObject eventInfo = logEvent(eventName);
            Log.d(\"Flurry Plugin\", \"Returning \"+ fileInfo.toString());
            result = new PluginResult(Status.OK, fileInfo);
            */
          } catch (JSONException jsonEx) {
            Log.d(\"Flurry Plugin\", \"Got JSON Exception \"+ jsonEx.getMessage());
            result = new PluginResult(Status.JSON_EXCEPTION);
          }          
        }
        else if(SET_ACTION.equals(action)) {
          try {
            String userID = data.getString(0);
            setUserID(userID);
          } catch (JSONException jsonEx) {
            Log.d(\"Flurry Plugin\", \"Got JSON Exception \"+ jsonEx.getMessage());
            result = new PluginResult(Status.JSON_EXCEPTION);
          }        
        }
        else {
          result = new PluginResult(Status.INVALID_ACTION);
          Log.d(\"Flurry Plugin\", \"Invalid action : \"+action+\" passed\");
        }
        return result;
      }
      
      public void countPageView() {
        Log.d(\"[Flurry Plugin]\", \"Counting page view\");
        FlurryAgent.onPageView();
      }

      public void logEvent(String eventName) {
        Log.d(\"[Flurry Plugin]\", \"Logging event with name: \"+eventName);
        FlurryAgent.logEvent(eventName, null);
      }

      public void setUserID(String userID) {
        Log.d(\"[Flurry Plugin]\", \"Setting User ID:\"+userID);
        // FlurryAgent.setUserID(userID);              
      }

    }
    "
    
    # code_dir = File.join(@path, "src", @pkg.gsub('.', File::SEPARATOR))
    # FileUtils.mkdir_p(code_dir)
    open(File.join(code_dir, "FlurryPlugin.java"),'w') { |f| f.puts j }

  end

  # friendly output for now
  def msg
    puts "Created #{ @path }"
  end
  #
end
