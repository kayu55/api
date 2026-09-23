#!/bin/bash
export TERM=xterm
export PATH="/usr/sbin:/usr/bin:/sbin:/bin"
if ! command -v at &> /dev/null; then
    apt update && sudo apt install -y at
	systemctl enable --now atd
fi

user="${1:-Trial}"
Pass="${2:-orderyuk}"
iplimit="${3:-1}"
masaaktif="${4:-1}"
pup="30"
Login="${user}SSH$(tr -dc 0-9 </dev/urandom | head -c3)"

IP=$(curl -sS ipv4.icanhazip.com)

checking_sc
if getent group "$Login" > /dev/null; then
    GROUP_OPTION="-g $Login"  # Gunakan grup yang ada
else
    /usr/sbin/groupadd "$Login"  # Buat grup baru
    GROUP_OPTION="-g $Login"
fi

egrep "^$Login" /etc/passwd >/dev/null
if [ $? -eq 0 ]; then
    echo "User $Login sudah ada."
    exit 1
fi
ISP=$(cat /etc/xray/isp)
CITY=$(cat /etc/xray/city)
domain=$(cat /etc/xray/domain)
nama=$(cat /etc/xray/username)
NS=$(cat /etc/xray/dns 2>/dev/null)
PUB=$( cat /etc/slowdns/server.pub 2>/dev/null )
tgl=$(date -d "$masaaktif days" +"%d")
bln=$(date -d "$masaaktif days" +"%b")
thn=$(date -d "$masaaktif days" +"%Y")
expe="$tgl $bln, $thn"
tgl2=$(date +"%d")
bln2=$(date +"%b")
thn2=$(date +"%Y")
tnggl="$tgl2 $bln2, $thn2"
/usr/sbin/useradd -e "$(date -d "$masaaktif days" +"%Y-%m-%d")" -s /bin/false -M $GROUP_OPTION "$Login"
expi="$(chage -l $Login | grep "Account expires" | awk -F": " '{print $2}')"
echo -e "$Pass\n$Pass\n"| passwd $Login &> /dev/null
hariini=`date -d "0 days" +"%Y-%m-%d"`
expi=`date -d "$masaaktif days" +"%Y-%m-%d"`
egrep "^$Login" /etc/passwd >/dev/null
if [ $? -ne 0 ]; then
    echo "Gagal membuat user $Login. Periksa log untuk detail."
    exit 1
fi
if [[ $iplimit -gt 0 ]]; then
mkdir -p /etc/kyt/limit/ssh/ip/
echo -e "$iplimit" > /etc/kyt/limit/ssh/ip/$Login
else
echo > /dev/null
fi

if [ ! -e /etc/ssh ]; then
  mkdir -p /etc/ssh
fi

DATADB=$(cat /etc/ssh/.ssh.db | grep "^#ssh#" | grep -w "${Login}" | awk '{print $2}')
if [[ "${DATADB}" != '' ]]; then
  sed -i "/\b${Login}\b/d" /etc/ssh/.ssh.db
  echo "#ssh# ${Login} ${Pass} ${iplimit} ${expe}" >>/etc/ssh/.ssh.db
else
echo "#ssh# ${Login} ${Pass} ${iplimit} ${expe}" >>/etc/ssh/.ssh.db
fi

echo userdel -f "$Login" | at now + $pup minutes

mkdir -p /detail/ssh/
#Simpan Detail Akun User
cat > /detail/ssh/$Login.txt <<-END
-----------------------------------------
Trial SSH Account
-----------------------------------------
Host             : $domain
IP               : $IP
Username         : $Login
Password         : $Pass
-----------------------------------------
Limit Ip         : ${iplimit} IP
Host Slowdns     : ${NS}
Pub Key          : ${PUB}
Port OpenSSH     : 22
Port DNS         : 53, 2222
Port SSH UDP     : 1-65535
Port Dropbear    : 22, 109
Port SSH WS      : 80,8080,2086,8880
Port SSH WS SSL  : 443,8443
Port SSL/TLS     : 443
BadVPN UDP       : 7100, 7300, 7300
-----------------------------------------
HTTP CUSTOM      : $domain:1-65535@$Login:$Pass"
-----------------------------------------
Payload          : GET /cdn-cgi/trace HTTP/1.1[crlf]Host: Bug_Kalian[crlf][crlf]GET-RAY / HTTP/1.1[crlf]Host: [host][crlf]Connection: Upgrade[crlf]User-Agent: [ua][crlf]Upgrade: websocket[crlf][crlf]
-----------------------------------------
Save Link Account: https://$domain:81/ssh-$Login.txt
-----------------------------------------
Dibuat Pada      : $tnggl
Aktif Selama     : $pup Minutes
-----------------------------------------

END

cat > /var/www/html/ssh-$Login.txt <<-END
-----------------------------------------
Trial SSH Account
-----------------------------------------
Host             : $domain
IP               : $IP
Username         : $Login
Password         : $Pass
-----------------------------------------
Limit Ip         : ${iplimit} IP
Host Slowdns     : ${NS}
Pub Key          : ${PUB}
Port OpenSSH     : 22
Port DNS         : 53, 2222
Port SSH UDP     : 1-65535
Port Dropbear    : 22, 109
Port SSH WS      : 80,8080,2086,8880
Port SSH WS SSL  : 443,8443
Port SSL/TLS     : 443
BadVPN UDP       : 7100, 7300, 7300
-----------------------------------------
HTTP CUSTOM      : $domain:1-65535@$Login:$Pass"
-----------------------------------------
Payload          : GET /cdn-cgi/trace HTTP/1.1[crlf]Host: Bug_Kalian[crlf][crlf]GET-RAY / HTTP/1.1[crlf]Host: [host][crlf]Connection: Upgrade[crlf]User-Agent: [ua][crlf]Upgrade: websocket[crlf][crlf]
-----------------------------------------
Save Link Account: https://$domain:81/ssh-$Login.txt
-----------------------------------------
Dibuat Pada      : $tnggl
Aktif Selama     : $pup Minutes
-----------------------------------------

END
CHATID="-1001911868043"
KEY="7876561487:AAHCpsZnu1LGx6w95fhqFMNSCT7fEGdv2vo"
export TIME="10"
export URL="https://api.telegram.org/bot$KEY/sendMessage"
sensor=$(echo "$Login" | sed 's/\(.\{3\}\).*/\1xxx/')
ISP=$(curl -s ipinfo.io/org | cut -d " " -f 2-10 )
clear
export TIME="10"
TEXT="
<b>-----------------------------------------</b>
<b>TRANSACTION SUCCESSFUL</b>
<b>-----------------------------------------</b>
<b>» Produk : Trial SSH</b>
<b>» ISP :</b> <code>${ISP}</code>
<b>» Limit Quota :</b> <code>${Quota} GB</code>
<b>» Limit Login :</b> <code>${iplimit} Hp</code>
<b>» Username :</b> <code>${sensor}</code>
<b>» Duration :</b> <code>${pup} Minutes</code>
<b>-----------------------------------------</b>
<i>Automatic Notification From Server</i>
<b>-----------------------------------------</b>
"
 
curl -s --max-time $TIME -d "chat_id=$CHATID&disable_web_page_preview=1&text=$TEXT&parse_mode=html" $URL >/dev/null
clear
echo -e " TRIAL SSH ACCOUNT "
echo -e " Remark      : $Login "
echo -e " Password    : $Pass "
echo -e " Limit Ip    : ${iplimit} IP"
echo -e " Domain      : $domain "
echo -e " Ns Domain : $NS  "
echo -e " OpenSSH     : 443, 80, 22 "
echo -e " Port UDP    : 1-65535 "
echo -e " Pub Key    :  $PUB "
echo -e " SSH WS      : 80,8080,8880,2086 "
echo -e " SSL/TLS     : 443 "
echo -e " OVPN UDP    : 2200 "
echo -e " Port 80     : $domain:80@$Login:$Pass "
echo -e " Port 443    : $domain:443@$Login:$Pass "
echo -e " Udp Custom  : $domain:1-65535@$Login:$Pass"
echo -e " OpenVpn     : https://$domain:81/ "
echo -e " Account     : https://$domain:81/ssh-$Login.txt "
echo -e " Payload WS  : GET / HTTP/1.1[crlf]Host: [host][crlf]Connection: Upgrade[crlf]User-Agent: [ua][crlf]Upgrade: websocket[crlf][crlf]"
echo -e " Payload TLS : GET wss://$domain/ HTTP/1.1[crlf]Host: [host][crlf]Connection: Upgrade[crlf]User-Agent: [ua][crlf]Upgrade: websocket[crlf][crlf]"
echo -e " Payload ENCD: HEAD / HTTP/1.1[crlf]Host: Masukan_Bug[crlf][crlf]PATCH / HTTP/1.1[crlf]Host: [host][crlf]Upgrade: websocket[crlf][crlf][split]HTTP/ 1[crlf][crlf]"
echo -e " Days in    : $masaaktif Day "
echo -e " Expiry in  : $pup Minutes "