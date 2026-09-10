using Microsoft.EntityFrameworkCore;
using PacientesCitaSOAPRest.Models;

namespace PacientesCitaSOAPRest.Data
{
    public class PacientesCitaDbContext : DbContext
    {
        public PacientesCitaDbContext(DbContextOptions<PacientesCitaDbContext> options)
            : base(options)
        {
        }

        public DbSet<Paciente> Pacientes { get; set; }
        public DbSet<Medico> Medicos { get; set; }
        public DbSet<Cita> Citas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Paciente>().ToTable("Paciente");
            modelBuilder.Entity<Medico>().ToTable("Medico");

            modelBuilder.Entity<Cita>(entity =>
            {
                entity.ToTable("Cita");

                entity.HasOne(c => c.Paciente)
                      .WithMany()
                      .HasForeignKey(c => c.IdPaciente)
                      .OnDelete(DeleteBehavior.Restrict)
                      .HasConstraintName("FK_Cita_Paciente");

                entity.HasOne(c => c.Medico)
                      .WithMany()
                      .HasForeignKey(c => c.IdMedico)
                      .OnDelete(DeleteBehavior.Restrict)
                      .HasConstraintName("FK_Cita_Medico");
            });
        }
    }
}
