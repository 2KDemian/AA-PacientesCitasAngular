using System.Globalization;
using CoreWCF;
using CoreWCF.Configuration;
using CoreWCF.Description;
using Microsoft.EntityFrameworkCore;
using PacientesCitaSOAPRest.Data;
using PacientesCitaSOAPRest.Services;

// Fuerza el uso de punto (.) como separador decimal, sin importar
// la configuración regional de Windows
CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;
CultureInfo.DefaultThreadCurrentCulture = CultureInfo.InvariantCulture;
CultureInfo.DefaultThreadCurrentUICulture = CultureInfo.InvariantCulture;

var builder = WebApplication.CreateBuilder(args);

// ---------- Base de datos compartida (Paciente, Medico, Cita) ----------
builder.Services.AddDbContext<PacientesCitaDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("PacientesCitaConnection")
    )
);

// ---------- SOAP: Paciente + Medico ----------
builder.Services.AddScoped<PacienteMedicoService>();

builder.Services
    .AddServiceModelServices()
    .AddServiceModelMetadata();

builder.Services.AddSingleton<IServiceBehavior,
    UseRequestHeadersForMetadataAddressBehavior>();

builder.WebHost.ConfigureKestrel(options =>
{
    options.AllowSynchronousIO = true;
});

// ---------- REST: Cita ----------
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// ---------- CORS para el frontend Angular ----------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("AngularPolicy");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// ---------- Middleware SOAP ----------
app.UseServiceModel(serviceBuilder =>
{
    serviceBuilder
        .AddService<PacienteMedicoService>()
        .AddServiceEndpoint<PacienteMedicoService, IPacienteMedicoService>(
            new BasicHttpBinding(),
            "/PacienteMedicoService.svc"
        );
});

var metadataBehavior =
    app.Services.GetRequiredService<ServiceMetadataBehavior>();

metadataBehavior.HttpGetEnabled = true;

// ---------- Middleware REST ----------
app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();
