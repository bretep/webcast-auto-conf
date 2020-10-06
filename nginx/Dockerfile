FROM balenalib/armv7hf-alpine
RUN mkdir -p /files
RUN \
  build_pkgs="build-base linux-headers openssl-dev pcre-dev wget zlib-dev" && \
  runtime_pkgs="ca-certificates openssl pcre zlib" && \
  apk --update add ${build_pkgs} ${runtime_pkgs} && \
  cd /tmp && \
  wget http://nginx.org/download/nginx-1.18.0.tar.gz && \
  tar xzf nginx-1.18.0.tar.gz && \
  wget -O nginx-rtmp-module-1.2.1.tar.gz https://github.com/arut/nginx-rtmp-module/archive/v1.2.1.tar.gz && \
  tar xzf nginx-rtmp-module-1.2.1.tar.gz && \
  cd /tmp/nginx-1.18.0 && \
  ./configure \
    --add-module=/tmp/nginx-rtmp-module-1.2.1 \
    --with-cc-opt="-Os -s -Wimplicit-fallthrough=0" \
    --prefix=/etc/nginx \
    --sbin-path=/usr/sbin/nginx \
    --conf-path=/etc/nginx/nginx.conf \
    --error-log-path=/var/log/nginx/error.log \
    --http-log-path=/var/log/nginx/access.log \
    --pid-path=/var/run/nginx.pid \
    --lock-path=/var/run/nginx.lock \
    --http-client-body-temp-path=/var/cache/nginx/client_temp \
    --http-proxy-temp-path=/var/cache/nginx/proxy_temp \
    --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp \
    --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp \
    --http-scgi-temp-path=/var/cache/nginx/scgi_temp \
    --user=nginx \
    --group=nginx \
    --with-http_ssl_module \
    --without-pcre \
    --without-http-cache \
    --without-http_rewrite_module \
    --without-http_gzip_module \
    --without-http_charset_module \
    --without-http_ssi_module \
    --without-http_fastcgi_module \
    --without-http_uwsgi_module \
    --without-http_scgi_module \
    --without-mail_pop3_module \
    --without-mail_imap_module \
    --without-stream_access_module \
    --without-stream_geo_module \
    --without-stream_limit_conn_module \
    --without-stream_map_module \
    --without-stream_return_module \
    --without-stream_upstream_hash_module \
    --without-stream_upstream_least_conn_module \
    --without-stream_upstream_zone_module \
    --without-http_userid_module \
    --without-http_access_module \
    --without-http_auth_basic_module \
    --without-http_browser_module && \
  make && \
  mkdir -p /tmp/nginx && \
  make DESTDIR=/tmp/nginx install && \
  ls -lsah /tmp/nginx/usr/sbin/nginx
WORKDIR /files
CMD ["cp", "/tmp/nginx/usr/sbin/nginx", "."]