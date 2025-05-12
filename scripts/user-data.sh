sudo apt update -y

sudo git clone https://${github_user}:${github_token}@github.com/technanimals/${repo_name}.git

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

source ~/.bashrc

nvm install 18

npm install -g yarn@1

yarn global add pm2

yarn --cwd /${repo_name} install

yarn run build --cwd /${repo_name} --concurrency=1

sudo apt install awscli -y

sudo apt install nginx -y

sudo systemctl start nginx

sudo rm -rf /etc/nginx/sites-enabled/default

sudo cp /${repo_name}/nginx.conf /etc/nginx/sites-enabled/default

sudo snap install --classic certbot

sudo ln -s /snap/bin/certbot /usr/bin/certbot

sudo certbot --nginx -m lebogang@technanimals.com -d ${domain_name} --agree-tos --non-interactive
