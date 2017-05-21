using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;
using Windows.UI.Xaml.Navigation;
using Microsoft.Azure.Devices;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Collections.ObjectModel;
using System.Threading;
using Windows.UI.Xaml.Media.Imaging;

// The Blank Page item template is documented at https://go.microsoft.com/fwlink/?LinkId=402352&clcid=0x409

namespace ArtificalDeviceDemo
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {

       
        struct DeviceTwinData
        {
            public string deviceJson;
            public string tagsJson;
            public string reportedPropertiesJson;
            public string desiredPropertiesJson;
        }


        public class MyMachine
        {
            //public IList<locationclass> location { get; set; }
            //public IList<settingsclass> settings { get; set; }

            //public List<string> location { get; set; }
            //public List<string> settings { get; set; }

            public locationClass location { get; set; }
            public settingsclass settings { get; set; }

        }




        public class locationClass
        {
            public string region { get; set; }
            public string plant { get; set; }
  
        }

        public class settingsclass
        {
            public Double RollerFreq { get; set; }
            public Double PresserFreq { get; set; }
   
        }




        static RegistryManager registryManager;
        static string IotHubConnectionString = "";
        static string DeviceConnectionString = "";
        static string deviceId = "MMSArtificalDevice";
        static string SharedAccessKeyName = "iothubowner";
        static ServiceClient client;

        DispatcherTimer blinkTimer = new DispatcherTimer();

        BitmapImage BlinkOn = new BitmapImage(new Uri("ms-appx:///Assets/redlightblink.png"));
        BitmapImage BlinkOff = new BitmapImage(new Uri("ms-appx:///Assets/redlightblinkOFF.png"));
        public MainPage()
        {
            this.InitializeComponent();
            registryManager = RegistryManager.CreateFromConnectionString(IotHubConnectionString);

            
            blinkTimer.Interval = TimeSpan.FromSeconds(5);
            blinkTimer.Tick += Timer_TickAsync;
            blinkTimer.Start();


        }


        private async void Timer_TickAsync(object sender, object e)
        {
            System.Diagnostics.Debug.WriteLine("TICK!");
            ImgBlinker.Source = BlinkOn;
            await Task.Delay(TimeSpan.FromSeconds(.5));
            ImgBlinker.Source = BlinkOff;

        }



        private void Grid_Loaded(object sender, RoutedEventArgs e)
        {
            MyMain();
           System.Diagnostics.Debug.WriteLine("app DONE!");
        }


        public async Task MyMain()
        {
            await GetDevice();
        }

        public async Task GetDevice()
        {
            DeviceTwinData result = new DeviceTwinData();

            var twin = await registryManager.GetTwinAsync(deviceId);

            var deviceTwin = await registryManager.GetTwinAsync(twin.DeviceId);

            if (deviceTwin != null)
            {
                result.deviceJson = deviceTwin.ToJson();
                result.tagsJson = deviceTwin.Tags.ToJson();
                result.reportedPropertiesJson = deviceTwin.Properties.Reported.ToJson();
                result.desiredPropertiesJson = deviceTwin.Properties.Desired.ToJson();
             
            }

            //System.Diagnostics.Debug.WriteLine(result.deviceJson);
            //System.Diagnostics.Debug.WriteLine(result.tagsJson);
            //System.Diagnostics.Debug.WriteLine(result.reportedPropertiesJson);
            //System.Diagnostics.Debug.WriteLine(result.desiredPropertiesJson);

            System.Diagnostics.Debug.WriteLine("Device JSON");
            System.Diagnostics.Debug.WriteLine(result.tagsJson);

            string Json = result.tagsJson;

            MyMachine TestMachine = JsonConvert.DeserializeObject<MyMachine>(Json);



            //string MachineLocation = TestMachine.location;
            //string MachineSettings = TestMachine.settings;

            System.Diagnostics.Debug.WriteLine(TestMachine);
            System.Diagnostics.Debug.WriteLine(TestMachine.settings.PresserFreq);
            System.Diagnostics.Debug.WriteLine(TestMachine.settings.RollerFreq);


            Text_FirstRow.Text = "Press Freq: " + TestMachine.settings.PresserFreq;
            Text_SecondRow.Text = "Roller Freq: " + TestMachine.settings.RollerFreq;


            blinkTimer.Interval = TimeSpan.FromSeconds(TestMachine.settings.RollerFreq);

            
            

            //RollerFreq: 44,
            //       PresserFreq: 22

        }

        
        public static async Task CloudCommand()
        {
            client = ServiceClient.CreateFromConnectionString(IotHubConnectionString);
            CloudToDeviceMethod method = new CloudToDeviceMethod("TestCommand");
            method.ResponseTimeout = TimeSpan.FromSeconds(30);

            CloudToDeviceMethodResult result = await client.InvokeDeviceMethodAsync(deviceId, method);

            System.Diagnostics.Debug.WriteLine("Invoked cloud command update on device.");
        }








        public static async Task AddTagsAndQuery()
        {

            var patch =
                @"{
             tags: {
                 location: {
                     region: 'US',
                     plant: 'Madison43'
                 },
                 settings: {
                     RollerFreq: 44,
                     PresserFreq: 22,
                     
                 },
             }
         }";

            var twin = await registryManager.GetTwinAsync(deviceId);

            await registryManager.UpdateTwinAsync(twin.DeviceId, patch, twin.ETag);


            var query = registryManager.CreateQuery("SELECT * FROM devices WHERE tags.location.plant = 'Madison43'", 100);
            var twinsInRedmond43 = await query.GetNextAsTwinAsync();
           System.Diagnostics.Debug.WriteLine("Devices in Madison43: {0}", string.Join(", ", twinsInRedmond43.Select(t => t.DeviceId)));

            query = registryManager.CreateQuery("SELECT * FROM devices WHERE tags.location.plant = 'Madison43' AND properties.reported.connectivity.type = 'cellular'", 100);
            var twinsInRedmond43UsingCellular = await query.GetNextAsTwinAsync();
           System.Diagnostics.Debug.WriteLine("Devices in Madison43 using cellular network: {0}", string.Join(", ", twinsInRedmond43UsingCellular.Select(t => t.DeviceId)));
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            System.Diagnostics.Debug.WriteLine("Butotn Press!");
            GetDevice();
        }
    }
}
