using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;

namespace Sonora.Native
{
    public partial class App : Application
    {
        public static MainWindow? MainAppWindow { get; private set; }

        public App()
        {
            this.InitializeComponent();
        }

        protected override void OnLaunched(LaunchActivatedEventArgs args)
        {
            MainAppWindow = new MainWindow();
            MainAppWindow.Activate();
        }
    }
}
