// NEEDED LIBRARIES

//Adafruit DHT Sensor Library
//AzureIoTHub
//AzureIoTUtility
//AzureIoTProtocol_MQTT
//AzureIoTProtocol_HTTP
//Adafruit Unified Sensor
//Adafruit_GFX
//Adafruit_SSD1306
//Adafruit_Sensor
//ESP8266WiFi

#include <DHT.h>
#include <DHT_U.h>
#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_Sensor.h>
#include <math.h>

// WIFI

#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <WiFiUdp.h>


// IOT SETUP

#include "iot_configs.h"
#include <AzureIoTHub.h>
#include <AzureIoTUtility.h>
#include <AzureIoTProtocol_HTTP.h>
#include "simplesample_http.h"

static AzureIoTHubClient iotHubClient;

// WI FI Setup

static char ssid[] = "";     // your network SSID (name)
static char pass[] = "";    // your network password (use for WPA, or use as key for WEP)


//Feather Wing Setup

Adafruit_SSD1306 display = Adafruit_SSD1306();

#if defined(ESP8266)
#define BUTTON_A 0
#define BUTTON_B 16
#define BUTTON_C 2
#define LED      0
#elif defined(ESP32)
#define BUTTON_A 15
#define BUTTON_B 32
#define BUTTON_C 14
#define LED      13
#elif defined(ARDUINO_STM32F2_FEATHER)
#define BUTTON_A PA15
#define BUTTON_B PC7
#define BUTTON_C PC5
#define LED PB5
#elif defined(TEENSYDUINO)
#define BUTTON_A 4
#define BUTTON_B 3
#define BUTTON_C 8
#define LED 13
#elif defined(ARDUINO_FEATHER52)
#define BUTTON_A 31
#define BUTTON_B 30
#define BUTTON_C 27
#define LED 17
#else // 32u4, M0, and 328p
#define BUTTON_A 9
#define BUTTON_B 6
#define BUTTON_C 5
#define LED      13
#endif

#if (SSD1306_LCDHEIGHT != 32)
#error("Height incorrect, please fix Adafruit_SSD1306.h!");
#endif

// DHT SETUP
#define DHTPIN            2         // Pin which is connected to the DHT sensor.
#define DHTTYPE           DHT22     // DHT 22 (AM2302)

float temp;
float humid;

DHT_Unified dht(DHTPIN, DHTTYPE);

uint32_t delayMS;

//Handy Vars

int ledPin = 13;                 // LED connected to digital pin 13


void setup() {
  Serial.begin(9600);

  Serial.println("OLED FeatherWing test");
  // by default, we'll generate the high voltage from the 3.3v line internally! (neat!)
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);  // initialize with the I2C addr 0x3C (for the 128x32)
  // init done
  Serial.println("OLED begun");

  // Show image buffer on the display hardware.
  // Since the buffer is intialized with an Adafruit splashscreen
  // internally, this will display the splashscreen.
  display.display();
  delay(1000);

  // Clear the buffer.
  display.clearDisplay();
  display.display();

  Serial.println("IO test");
    // text display tests
  display.setTextSize(1);
  display.setTextColor(0xF800);
  display.setCursor(0, 0);
  display.println("Starting Setup!");
  display.setCursor(0, 0);
  display.display(); // actually display all of the above
  display.setTextColor(WHITE);
  // Initialize device.

  display.println("Init DHT22!");
  display.display(); // actually display all of the above
  
  dht.begin();
  Serial.println("DHTxx Unified Sensor Example");
  // Print temperature sensor details.
  sensor_t sensor;
  dht.temperature().getSensor(&sensor);
  Serial.println("------------------------------------");
  Serial.println("Temperature");
  Serial.print  ("Sensor:       "); Serial.println(sensor.name);
  Serial.print  ("Driver Ver:   "); Serial.println(sensor.version);
  Serial.print  ("Unique ID:    "); Serial.println(sensor.sensor_id);
  Serial.print  ("Max Value:    "); Serial.print(sensor.max_value); Serial.println(" *C");
  Serial.print  ("Min Value:    "); Serial.print(sensor.min_value); Serial.println(" *C");
  Serial.print  ("Resolution:   "); Serial.print(sensor.resolution); Serial.println(" *C");
  Serial.println("------------------------------------");
  // Print humidity sensor details.
  dht.humidity().getSensor(&sensor);
  Serial.println("------------------------------------");
  Serial.println("Humidity");
  Serial.print  ("Sensor:       "); Serial.println(sensor.name);
  Serial.print  ("Driver Ver:   "); Serial.println(sensor.version);
  Serial.print  ("Unique ID:    "); Serial.println(sensor.sensor_id);
  Serial.print  ("Max Value:    "); Serial.print(sensor.max_value); Serial.println("%");
  Serial.print  ("Min Value:    "); Serial.print(sensor.min_value); Serial.println("%");
  Serial.print  ("Resolution:   "); Serial.print(sensor.resolution); Serial.println("%");
  Serial.println("------------------------------------");
  
  // Set delay between sensor readings based on sensor details.
  delayMS = sensor.min_delay / 1000;

  delay(1000);

  display.println("Init PinModes!");
  display.display(); // actually display all of the above

  // Pin Modes


 
  pinMode(BUTTON_A, INPUT_PULLUP);
  pinMode(BUTTON_B, INPUT_PULLUP);
  pinMode(BUTTON_C, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);

  
  //Hardware Stuff Done! - Let's get on the Internets!

  display.println("Init Wifi!");
  display.display(); // actually display all of the above
 
  initWifi();
 
  delay(1000);

  display.println("Init Time!");
  display.display(); // actually display all of the above
  
  initTime();

  delay(1000);
  
  display.println("Ready to Go!");
  display.display(); // actually display all of the above

  display.println("Good Luck! Have Fun!");
  display.display(); // actually display all of the above

  
  delay(5000);
  
}

void loop() {
  // Delay between measurements.
  delay(delayMS);

   int wifiStatus;
 
  
  // Get temperature event and print its value.
  sensors_event_t event;
  dht.temperature().getEvent(&event);
 
    // Clear the buffer.
  display.clearDisplay();
  display.display();

  display.println("Welcome to MMS!");
  display.display();
  
  
  if (std::isnan(event.temperature)) {
    Serial.println("Error reading temperature!");
  }
  else {
    Serial.print("Temperature: ");
    Serial.print(event.temperature);
    Serial.println(" *C");
    display.print("Temperature: ");
    display.print(event.temperature);
    display.println(" C");
    display.display();
  }
  
  // Get humidity event and print its value.
  dht.humidity().getEvent(&event);
  if (std::isnan(event.relative_humidity)) {
    Serial.println("Error reading humidity!");
  }
  else {
    Serial.print("Humidity: ");
    Serial.print(event.relative_humidity);
    Serial.println("%");
    
    display.print("Humidity: ");
    display.print(event.relative_humidity);
    display.println(" %");
    
  }


  wifiStatus = WiFi.status();
  if( wifiStatus == 3)
  {
    display.println("Wifi: Connected!");
  }
  else
  {
    display.println("Wifi: Disconnected!");
  }


  display.display();


  display.display();
  display.setCursor(0, 0);

  //Turn On LED
  digitalWrite(ledPin, HIGH);   // sets the LED on
  //simplesample_http_run();
  delay(500);
  //Turn OFF Azure LED
  digitalWrite(ledPin, LOW);   // sets the LED on
}


//IOT FUNCITONS DOWN HERE


void initTime() {  
   time_t epochTime;

   configTime(0, 0, "pool.ntp.org", "time.nist.gov");

   display.println("Getting EpochTime...");
   display.display();

   while (true) {
       epochTime = time(NULL);

       if (epochTime == 0) {
           Serial.println("Fetching NTP epoch time failed! Waiting 2 seconds to retry.");
           delay(2000);
       } else {
           Serial.print("Fetched NTP epoch time is: ");
           Serial.println(epochTime);
           break;
       }
   }
}



void initWifi() {
    // Attempt to connect to Wifi network:
    Serial.print("\r\n\r\nAttempting to connect to SSID: ");
    Serial.println(ssid);

    display.println("Connecting to Wifi...");
    display.display();
    
    // Connect to WPA/WPA2 network. Change this line if using open or WEP network:
    WiFi.begin(ssid, pass);
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }
    
    Serial.println("\r\nConnected to wifi");
    display.println("Wifi OK!");
    display.display(); // actually display all of the above
    
}






