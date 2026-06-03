from astropy.cosmology import LambdaCDM

cosmo = LambdaCDM(H0 = 70, Om0=0.3, Ode0=0.7)


def calculate(z):

    return {
        "luminousity_distance_mpc":
            float(cosmo.luminousity_distance(z).value),
        "comoving_distance_mpc":
            float(cosmo.comoving_distance(z).value),
        "lookback_time_gyr":
            float(cosmo.lookback_time(z).value),
        "recession_speed_kmps":
            float(z * 299792.458)
    }