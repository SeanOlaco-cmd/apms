<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    protected $fillable = [
        'name',
        'code',
        'dean_name',
        'description',
        'is_active',
    ];

    public function programs()
    {
        return $this->hasMany(Program::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
