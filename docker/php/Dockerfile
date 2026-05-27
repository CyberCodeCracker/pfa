FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev \
    libpq-dev libzip-dev libicu-dev \
    && docker-php-ext-install \
        pdo_mysql mbstring exif pcntl bcmath gd zip intl \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backend

RUN groupadd -g 1000 www && useradd -u 1000 -ms /bin/bash -g www www

COPY --chown=www:www . .

USER www

EXPOSE 9000
CMD ["php-fpm"]
