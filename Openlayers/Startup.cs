﻿using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(Adornments_Openlayers.Startup))]

namespace Adornments_Openlayers
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}